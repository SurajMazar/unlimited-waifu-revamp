import * as ort from 'onnxruntime-web';

export function decodeImage(image: HTMLImageElement): ImageData {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = new OffscreenCanvas(width, height);
  const gl = canvas.getContext('webgl') as WebGLRenderingContext;
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  const image_data = new ImageData(width, height);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, image_data.data);
  gl.deleteTexture(texture);
  gl.deleteFramebuffer(framebuffer);

  return image_data;
}

export function toInput(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  keep_alpha = false
): ort.Tensor[] {
  if (keep_alpha) {
    const rgb = new Float32Array(height * width * 3);
    const alpha1 = new Float32Array(height * width * 1);
    const alpha3 = new Float32Array(height * width * 3);
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const i = y * width * 4 + x * 4;
        const j = y * width + x;
        rgb[j] = rgba[i + 0] / 255.0;
        rgb[j + 1 * (height * width)] = rgba[i + 1] / 255.0;
        rgb[j + 2 * (height * width)] = rgba[i + 2] / 255.0;
        const alpha = rgba[i + 3] / 255.0;
        alpha1[j] = alpha;
        alpha3[j] = alpha;
        alpha3[j + 1 * (height * width)] = alpha;
        alpha3[j + 2 * (height * width)] = alpha;
      }
    }
    return [
      new ort.Tensor('float32', rgb, [1, 3, height, width]),
      new ort.Tensor('float32', alpha1, [1, 1, height, width]),
      new ort.Tensor('float32', alpha3, [1, 3, height, width]),
    ];
  } else {
    const rgb = new Float32Array(height * width * 3);
    const bg_color = 1.0;
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const alpha = rgba[y * width * 4 + x * 4 + 3] / 255.0;
        for (let c = 0; c < 3; ++c) {
          const i = y * width * 4 + x * 4 + c;
          const j = y * width + x + c * (height * width);
          rgb[j] = alpha * (rgba[i] / 255.0) + (1 - alpha) * bg_color;
        }
      }
    }
    return [new ort.Tensor('float32', rgb, [1, 3, height, width])];
  }
}

export function toImageData(
  z: Float32Array,
  alpha3: Float32Array | null,
  width: number,
  height: number
): ImageData {
  const rgba = new Uint8ClampedArray(height * width * 4);
  if (alpha3 != null) {
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        let alpha_v = 0.0;
        for (let c = 0; c < 3; ++c) {
          const i = y * width * 4 + x * 4 + c;
          const j = y * width + x + c * (height * width);
          rgba[i] = z[j] * 255.0 + 0.49999;
          alpha_v += alpha3[j] * (1.0 / 3.0);
        }
        rgba[y * width * 4 + x * 4 + 3] = alpha_v * 255.0 + 0.49999;
      }
    }
  } else {
    rgba.fill(255);
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        for (let c = 0; c < 3; ++c) {
          const i = y * width * 4 + x * 4 + c;
          const j = y * width + x + c * (height * width);
          rgba[i] = z[j] * 255.0 + 0.49999;
        }
      }
    }
  }
  return new ImageData(rgba, width, height);
}

export function cropTensor(bchw: ort.Tensor, x: number, y: number, width: number, height: number): ort.Tensor {
  const [B, C, H, W] = bchw.dims as number[];
  const data = bchw.data as Float32Array;
  const ex = x + width;
  const ey = y + height;
  const roi = new Float32Array(B * C * height * width);
  let i = 0;
  for (let b = 0; b < B; ++b) {
    const bi = b * C * H * W;
    for (let c = 0; c < C; ++c) {
      const ci = bi + c * H * W;
      for (let h = y; h < ey; ++h) {
        const hi = ci + h * W;
        for (let w = x; w < ex; ++w) {
          roi[i++] = data[hi + w];
        }
      }
    }
  }
  return new ort.Tensor('float32', roi, [B, C, height, width]);
}

export function checkSingleColor(
  x: ort.Tensor,
  alpha3: ort.Tensor | null,
  keep_alpha = false
): [number, number, number, number] | null {
  const [B, C, H, W] = x.dims as number[];
  const data = x.data as Float32Array;
  const r0 = data[0];
  const g0 = data[1 * (H * W)];
  const b0 = data[2 * (H * W)];
  let a = 1.0;
  for (let bi = 0; bi < B; ++bi) {
    for (let h = 0; h < H; ++h) {
      for (let w = 0; w < W; ++w) {
        const i = bi * (C * H * W) + h * W + w;
        if (r0 !== data[i] || g0 !== data[i + 1 * (H * W)] || b0 !== data[i + 2 * (H * W)]) {
          return null;
        }
      }
    }
  }
  if (alpha3 != null) {
    const alphaData = alpha3.data as Float32Array;
    a = alphaData[0];
    const dims = alpha3.dims as number[];
    const n = dims[0] * dims[1] * dims[2] * dims[3];
    for (let i = 0; i < n; ++i) {
      if (a !== alphaData[i]) {
        return null;
      }
    }
  }
  if (keep_alpha) {
    return [r0, g0, b0, a];
  } else {
    const bg_color = 1.0;
    const r = a * r0 + (1 - a) * bg_color;
    const g = a * g0 + (1 - a) * bg_color;
    const b = a * b0 + (1 - a) * bg_color;
    return [r, g, b, 1.0];
  }
}

export function checkAlphaChannel(rgba: Uint8ClampedArray): boolean {
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] !== 255) return true;
  }
  return false;
}

export function createSingleColorTensor(rgba: [number, number, number, number], size: number): [ort.Tensor, ort.Tensor] {
  const rgb = new Float32Array(size * size * 3);
  const alpha3 = new Float32Array(size * size * 3);
  alpha3.fill(rgba[3]);
  for (let c = 0; c < 3; ++c) {
    const v = rgba[c];
    for (let i = 0; i < size * size; ++i) {
      rgb[c * size * size + i] = v;
    }
  }
  return [new ort.Tensor('float32', rgb, [1, 3, size, size]), new ort.Tensor('float32', alpha3, [1, 3, size, size])];
}

export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
