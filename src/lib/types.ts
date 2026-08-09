export type Arch = 'swin_unet' | 'cunet';
export type Domain = 'art' | 'art_scan' | 'photo';
export type Padding = 'replication' | 'reflection';

export interface MethodConfig {
  arch: Arch;
  domain: Domain;
  color_stability: boolean;
  padding: Padding;
  scale: 1 | 2 | 4;
  offset: number;
  calc_tile_size: (tile_size: number, config: MethodConfig) => number;
  path?: string;
}

export interface RenderProgress {
  progress: number;
  max: number;
  processing: boolean;
}

export type BlockCallback = (progress: number, max: number, processing: boolean) => void;

export interface SeamBlendingParams {
  y_h: number;
  y_w: number;
  input_offset: number;
  input_blend_size: number;
  input_tile_step: number;
  output_tile_step: number;
  h_blocks: number;
  w_blocks: number;
  y_buffer_h: number;
  y_buffer_w: number;
  pad: [number, number, number, number];
}

export const MODEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'swin_unet.art', label: '🎨 SwinUNet · Art' },
  { value: 'swin_unet.art_scan', label: '🖨 SwinUNet · Art Scan' },
  { value: 'swin_unet.photo', label: '📷 SwinUNet · Photo' },
  { value: 'cunet.art', label: '🎨 CUNet · Art (2018)' },
];

export const NOISE_OPTIONS: { value: number; label: string }[] = [
  { value: -1, label: 'None' },
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Highest' },
];

export const SCALE_OPTIONS: { value: 1 | 2 | 4; label: string }[] = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
];

export const TILE_OPTIONS: number[] = [64, 256, 400, 640];
export const TTA_OPTIONS: number[] = [0, 2, 4];
