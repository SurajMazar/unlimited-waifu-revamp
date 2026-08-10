import * as ort from 'onnxruntime-web';
import { CONFIG } from './config';
import { onnxSession } from './onnxSession';
import { SeamBlending } from './seamBlending';
import {
  toInput,
  toImageData,
  cropTensor,
  checkSingleColor,
  checkAlphaChannel,
  createSingleColorTensor,
  shuffleArray,
} from './imageUtils';
import type { MethodConfig, BlockCallback } from './types';

export { checkAlphaChannel };

// Hand control back to the browser so it can paint and process input.
//
// Inference runs wasm synchronously on the main thread (ORT's proxy worker is
// unusable under Vite — see useWaifu2x.ts), so without this the whole tile loop is
// one uninterrupted block: the page stops responding and the progress bar only moves
// once everything is already finished. A MessageChannel task is used rather than
// setTimeout because timers are clamped to ~1s in background tabs, which would stall
// renders whenever the user switches away.
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = () => {
      port1.close();
      resolve();
    };
    port2.postMessage(null);
  });
}

class OnnxRunner {
  stop_flag = false;
  running = false;

  async padding(x: ort.Tensor, left: bigint, right: bigint, top: bigint, bottom: bigint, mode: string) {
    const ses = await onnxSession.get_session(CONFIG.get_helper_model_path(mode + '_pad'));
    if (!ses) throw new Error('Failed to load padding model');
    const out = await ses.run({
      x,
      left: new ort.Tensor('int64', BigInt64Array.from([left]), []),
      right: new ort.Tensor('int64', BigInt64Array.from([right]), []),
      top: new ort.Tensor('int64', BigInt64Array.from([top]), []),
      bottom: new ort.Tensor('int64', BigInt64Array.from([bottom]), []),
    });
    return out.y;
  }

  async tta_split(x: ort.Tensor, tta_level: bigint) {
    const ses = await onnxSession.get_session(CONFIG.get_helper_model_path('tta_split'));
    if (!ses) throw new Error('Failed to load tta_split model');
    const out = await ses.run({ x, tta_level: new ort.Tensor('int64', BigInt64Array.from([tta_level]), []) });
    return out.y;
  }

  async tta_merge(x: ort.Tensor, tta_level: bigint) {
    const ses = await onnxSession.get_session(CONFIG.get_helper_model_path('tta_merge'));
    if (!ses) throw new Error('Failed to load tta_merge model');
    const out = await ses.run({ x, tta_level: new ort.Tensor('int64', BigInt64Array.from([tta_level]), []) });
    return out.y;
  }

  async alpha_border_padding(rgb: ort.Tensor, alpha: ort.Tensor, offset: bigint) {
    const ses = await onnxSession.get_session(CONFIG.get_helper_model_path('alpha_border_padding'));
    if (!ses) throw new Error('Failed to load alpha_border_padding model');
    const rgbDims = rgb.dims as number[];
    const alphaDims = alpha.dims as number[];
    const rgbSq = new ort.Tensor('float32', rgb.data as Float32Array, [rgbDims[1], rgbDims[2], rgbDims[3]]);
    const alphaSq = new ort.Tensor('float32', alpha.data as Float32Array, [alphaDims[1], alphaDims[2], alphaDims[3]]);
    const out = await ses.run({
      rgb: rgbSq,
      alpha: alphaSq,
      offset: new ort.Tensor('int64', BigInt64Array.from([offset]), []),
    });
    const outDims = out.y.dims as number[];
    return new ort.Tensor('float32', out.y.data as Float32Array, [1, outDims[0], outDims[1], outDims[2]]);
  }

  async tiled_render(
    image_data: ImageData,
    config: MethodConfig,
    alpha_config: MethodConfig | null,
    tta_level: number,
    tile_size: number,
    tile_random: boolean,
    output_canvas: HTMLCanvasElement,
    block_callback: BlockCallback
  ): Promise<void> {
    this.stop_flag = false;
    if (this.running) {
      console.warn('Already running');
      return;
    }
    this.running = true;

    output_canvas.width = image_data.width * config.scale;
    output_canvas.height = image_data.height * config.scale;
    const output_ctx = output_canvas.getContext('2d', { willReadFrequently: true })!;

    const has_alpha = alpha_config != null;
    const model = await onnxSession.get_session(config.path!);
    if (!model) throw new Error('Failed to load model: ' + config.path);
    let alpha_model: ort.InferenceSession | null = null;
    if (has_alpha) {
      alpha_model = await onnxSession.get_session(alpha_config!.path!);
    }

    const inputs = toInput(image_data.data, image_data.width, image_data.height, has_alpha);
    let x: ort.Tensor;
    let alpha3: ort.Tensor | { data: null };
    let seam_blending: SeamBlending;
    let seam_blending_alpha: SeamBlending | null = null;

    if (has_alpha) {
      const [rgb, alpha1, alpha3In] = inputs;
      seam_blending = new SeamBlending(rgb.dims, config.scale, config.offset, tile_size);
      seam_blending_alpha = new SeamBlending(alpha3In.dims, config.scale, config.offset, tile_size);
      await seam_blending_alpha.build();
      await seam_blending.build();

      const p = seam_blending.get_rendering_config();
      let paddedX: ort.Tensor = await this.alpha_border_padding(rgb, alpha1, BigInt(config.offset));
      paddedX = await this.padding(paddedX, BigInt(p.pad[0]), BigInt(p.pad[1]), BigInt(p.pad[2]), BigInt(p.pad[3]), config.padding);
      alpha3 = await this.padding(alpha3In, BigInt(p.pad[0]), BigInt(p.pad[1]), BigInt(p.pad[2]), BigInt(p.pad[3]), config.padding);
      x = paddedX;
    } else {
      alpha3 = { data: null };
      x = inputs[0];
      seam_blending = new SeamBlending(x.dims, config.scale, config.offset, tile_size);
      await seam_blending.build();
      const p = seam_blending.get_rendering_config();
      x = await this.padding(x, BigInt(p.pad[0]), BigInt(p.pad[1]), BigInt(p.pad[2]), BigInt(p.pad[3]), config.padding);
    }

    const p = seam_blending.get_rendering_config();
    const all_blocks = p.h_blocks * p.w_blocks;

    let progress = 0;
    const tiles: [number, number, number, number, number, number][] = [];
    for (let h_i = 0; h_i < p.h_blocks; ++h_i) {
      for (let w_i = 0; w_i < p.w_blocks; ++w_i) {
        const i = h_i * p.input_tile_step;
        const j = w_i * p.input_tile_step;
        const ii = h_i * p.output_tile_step;
        const jj = w_i * p.output_tile_step;
        tiles.push([i, j, ii, jj, h_i, w_i]);
      }
    }
    if (tile_random) shuffleArray(tiles);

    block_callback(0, all_blocks, true);

    for (let k = 0; k < tiles.length; ++k) {
      const [i, j, ii, jj, h_i, w_i] = tiles[k];

      let tile_x = cropTensor(x, j, i, tile_size, tile_size);
      let tile_alpha3: ort.Tensor | null = null;
      if (has_alpha) {
        tile_alpha3 = cropTensor(alpha3 as ort.Tensor, j, i, tile_size, tile_size);
      }
      const single_color = config.color_stability ? checkSingleColor(tile_x, tile_alpha3, has_alpha) : null;

      let tile_y: ort.Tensor;
      let tile_alpha_y: ort.Tensor | undefined;

      if (single_color == null) {
        if (has_alpha) {
          if (tta_level > 0) tile_x = await this.tta_split(tile_x, BigInt(tta_level));
          const output = await model.run({ x: tile_x });
          tile_y = output.y;
          if (tta_level > 0) tile_y = await this.tta_merge(tile_y, BigInt(tta_level));
          const alpha_output = await alpha_model!.run({ x: tile_alpha3! });
          tile_alpha_y = alpha_output.y;
        } else {
          if (tta_level > 0) tile_x = await this.tta_split(tile_x, BigInt(tta_level));
          const tile_output = await model.run({ x: tile_x });
          tile_y = tile_output.y;
          if (tta_level > 0) tile_y = await this.tta_merge(tile_y, BigInt(tta_level));
        }
      } else {
        const [colorTile, colorAlpha] = createSingleColorTensor(single_color, tile_size * config.scale - config.offset * 2);
        tile_y = colorTile;
        tile_alpha_y = colorAlpha;
      }

      let output_image_data: ImageData;
      if (has_alpha) {
        const rgb = seam_blending.update(tile_y, h_i, w_i);
        const alpha = seam_blending_alpha!.update(tile_alpha_y!, h_i, w_i);
        output_image_data = toImageData(rgb.data as Float32Array, alpha.data as Float32Array, tile_y.dims[3] as number, tile_y.dims[2] as number);
      } else {
        const rgb = seam_blending.update(tile_y, h_i, w_i);
        output_image_data = toImageData(rgb.data as Float32Array, null, tile_y.dims[3] as number, tile_y.dims[2] as number);
      }
      output_ctx.putImageData(output_image_data, jj, ii);
      ++progress;
      if (this.stop_flag) {
        block_callback(progress, all_blocks, false);
        this.running = false;
        return;
      } else {
        block_callback(progress, all_blocks, true);
      }
      // Let the browser paint this tile and pick up input (including Stop) before the
      // next one starts. Also what makes stop_flag observable mid-render.
      await yieldToBrowser();
    }
    this.running = false;
  }
}

export const onnxRunner = new OnnxRunner();
