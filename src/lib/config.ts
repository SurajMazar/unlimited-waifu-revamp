import type { Arch, Domain, MethodConfig } from './types';

// Ported from the original nunif/unlimited:waifu2x script.js `gen_arch_config()`

type ArchTable = Record<Arch, Record<Domain, Record<string, MethodConfig>>>;

function calcTileSizeSwinUnet(tile_size: number): number {
  let ts = tile_size;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if ((ts - 16) % 12 === 0 && (ts - 16) % 16 === 0) {
      break;
    }
    ts += 1;
  }
  return ts;
}

function calcTileSizeCunet(tile_size: number, config: MethodConfig): number {
  const adj = config.scale === 1 ? 16 : 32;
  let ts = (tile_size * config.scale + config.offset * 2 - adj) / config.scale;
  ts -= ts % 4;
  return ts;
}

function genArchConfig(): ArchTable {
  const swinBase: Record<Domain, { color_stability: boolean; padding: 'replication' | 'reflection' }> = {
    art: { color_stability: true, padding: 'replication' },
    art_scan: { color_stability: false, padding: 'replication' },
    photo: { color_stability: false, padding: 'reflection' },
  };

  const swin_unet = {} as Record<Domain, Record<string, MethodConfig>>;
  for (const domain of ['art', 'art_scan', 'photo'] as Domain[]) {
    const base: Omit<MethodConfig, 'scale' | 'offset'> = {
      arch: 'swin_unet',
      domain,
      color_stability: swinBase[domain].color_stability,
      padding: swinBase[domain].padding,
      calc_tile_size: calcTileSizeSwinUnet,
    };
    const methods: Record<string, MethodConfig> = {
      scale2x: { ...base, scale: 2, offset: 16 },
      scale4x: { ...base, scale: 4, offset: 32 },
      scale1x: { ...base, scale: 1, offset: 8 },
    };
    for (let i = 0; i < 4; ++i) {
      methods[`noise${i}_scale2x`] = { ...base, scale: 2, offset: 16 };
      methods[`noise${i}_scale4x`] = { ...base, scale: 4, offset: 32 };
      methods[`noise${i}`] = { ...base, scale: 1, offset: 8 };
    }
    swin_unet[domain] = methods;
  }

  const cunetBase: Omit<MethodConfig, 'scale' | 'offset'> = {
    arch: 'cunet',
    domain: 'art',
    color_stability: true,
    padding: 'replication',
    calc_tile_size: calcTileSizeCunet,
  };
  const cunetArt: Record<string, MethodConfig> = {
    scale2x: { ...cunetBase, scale: 2, offset: 36 },
    scale1x: { ...cunetBase, scale: 1, offset: 28 },
  };
  for (let i = 0; i < 4; ++i) {
    cunetArt[`noise${i}_scale2x`] = { ...cunetBase, scale: 2, offset: 36 };
    cunetArt[`noise${i}`] = { ...cunetBase, scale: 1, offset: 28 };
  }

  return {
    swin_unet,
    cunet: { art: cunetArt, art_scan: {}, photo: {} },
  };
}

const ARCH = genArchConfig();

// Cache-busting token appended to every model URL.
//
// An earlier deploy shipped without the .onnx weights, and vercel.json applied
// `immutable, max-age=1y` to those 404s — so browsers that visited while the
// models were missing pinned the 404 and won't re-request the path even now
// that it serves correctly. Bumping this changes the URL, sidestepping those
// poisoned entries without asking every user to clear their cache.
const MODEL_VERSION = '2';

function modelUrl(path: string): string {
  return `${path}?v=${MODEL_VERSION}`;
}

export const CONFIG = {
  arch: ARCH,
  get_config(arch: Arch, domain: Domain, method: string): MethodConfig | null {
    const table = this.arch[arch]?.[domain];
    if (table && method in table) {
      const config = { ...table[method] };
      config.path = modelUrl(`models/${arch}/${domain}/${method}.onnx`);
      return config;
    }
    return null;
  },
  get_helper_model_path(name: string): string {
    return modelUrl(`models/utils/${name}.onnx`);
  },
};
