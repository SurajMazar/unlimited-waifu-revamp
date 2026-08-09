import * as ort from 'onnxruntime-web';
import { CONFIG } from './config';
import { onnxSession } from './onnxSession';
import type { SeamBlendingParams } from './types';

const BLEND_SIZE = 16;

// Cumulative Tile Seam/Border Blending
// Ported from nunif/utils/seam_blending.py via the original script.js implementation.
export class SeamBlending {
  x_size: readonly number[];
  scale: number;
  offset: number;
  tile_size: number;
  blend_size: number;
  param!: SeamBlendingParams;
  pixels!: ort.Tensor;
  weights!: ort.Tensor;
  blend_filter!: ort.Tensor;
  output!: ort.Tensor;

  constructor(x_size: readonly number[], scale: number, offset: number, tile_size: number, blend_size = BLEND_SIZE) {
    this.x_size = x_size;
    this.scale = scale;
    this.offset = offset;
    this.tile_size = tile_size;
    this.blend_size = blend_size;
  }

  async build() {
    this.param = SeamBlending.calc_parameters(this.x_size, this.scale, this.offset, this.tile_size, this.blend_size);
    this.pixels = new ort.Tensor(
      'float32',
      new Float32Array(this.param.y_buffer_h * this.param.y_buffer_w * 3),
      [3, this.param.y_buffer_h, this.param.y_buffer_w]
    );
    this.weights = new ort.Tensor(
      'float32',
      new Float32Array(this.param.y_buffer_h * this.param.y_buffer_w * 3),
      [3, this.param.y_buffer_h, this.param.y_buffer_w]
    );
    this.blend_filter = await this.create_seam_blending_filter();
    this.output = new ort.Tensor('float32', new Float32Array(this.blend_filter.data.length), this.blend_filter.dims);
  }

  update(x: ort.Tensor, tile_i: number, tile_j: number): ort.Tensor {
    const step_size = this.param.output_tile_step;
    const [, H, W] = this.blend_filter.dims as number[];
    const HW = H * W;
    const buffer_h = this.pixels.dims[1] as number;
    const buffer_w = this.pixels.dims[2] as number;
    const buffer_hw = buffer_h * buffer_w;
    const h_i = step_size * tile_i;
    const w_i = step_size * tile_j;

    const pixelsData = this.pixels.data as Float32Array;
    const weightsData = this.weights.data as Float32Array;
    const filterData = this.blend_filter.data as Float32Array;
    const outputData = this.output.data as Float32Array;
    const xData = x.data as Float32Array;

    let old_weight: number, next_weight: number, new_weight: number;
    for (let c = 0; c < 3; ++c) {
      for (let i = 0; i < H; ++i) {
        for (let j = 0; j < W; ++j) {
          const tile_index = c * HW + i * W + j;
          const buffer_index = c * buffer_hw + (h_i + i) * buffer_w + (w_i + j);
          old_weight = weightsData[buffer_index];
          next_weight = old_weight + filterData[tile_index];
          old_weight = old_weight / next_weight;
          new_weight = 1.0 - old_weight;
          pixelsData[buffer_index] = pixelsData[buffer_index] * old_weight + xData[tile_index] * new_weight;
          weightsData[buffer_index] += filterData[tile_index];
          outputData[tile_index] = pixelsData[buffer_index];
        }
      }
    }
    return this.output;
  }

  get_rendering_config(): SeamBlendingParams {
    return this.param;
  }

  static calc_parameters(
    x_size: readonly number[],
    scale: number,
    offset: number,
    tile_size: number,
    blend_size: number
  ): SeamBlendingParams {
    const x_h = x_size[2];
    const x_w = x_size[3];

    const y_h = x_h * scale;
    const y_w = x_w * scale;

    const input_offset = Math.ceil(offset / scale);
    const input_blend_size = Math.ceil(blend_size / scale);
    const input_tile_step = tile_size - (input_offset * 2 + input_blend_size);
    const output_tile_step = input_tile_step * scale;

    let h_blocks = 0;
    let w_blocks = 0;
    let input_h = 0;
    let input_w = 0;
    while (input_h < x_h + input_offset * 2) {
      input_h = h_blocks * input_tile_step + tile_size;
      ++h_blocks;
    }
    while (input_w < x_w + input_offset * 2) {
      input_w = w_blocks * input_tile_step + tile_size;
      ++w_blocks;
    }

    const y_buffer_h = input_h * scale;
    const y_buffer_w = input_w * scale;
    const pad: [number, number, number, number] = [
      input_offset,
      input_w - (x_w + input_offset),
      input_offset,
      input_h - (x_h + input_offset),
    ];

    return {
      y_h,
      y_w,
      input_offset,
      input_blend_size,
      input_tile_step,
      output_tile_step,
      h_blocks,
      w_blocks,
      y_buffer_h,
      y_buffer_w,
      pad,
    };
  }

  async create_seam_blending_filter(): Promise<ort.Tensor> {
    const ses = await onnxSession.get_session(CONFIG.get_helper_model_path('create_seam_blending_filter'));
    if (!ses) throw new Error('Failed to load seam blending filter model');
    const scale = new ort.Tensor('int64', BigInt64Array.from([BigInt(this.scale)]), []);
    const offset = new ort.Tensor('int64', BigInt64Array.from([BigInt(this.offset)]), []);
    const tile_size = new ort.Tensor('int64', BigInt64Array.from([BigInt(this.tile_size)]), []);
    const out = await ses.run({ scale, offset, tile_size });
    return out.y;
  }
}
