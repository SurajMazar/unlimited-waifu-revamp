export interface Preferences {
  model: string;
  noise_level: number;
  scale: 1 | 2 | 4;
  tile_size: number;
  tile_random: boolean;
  tta: number;
  alpha: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  model: 'swin_unet.art',
  noise_level: 0,
  scale: 2,
  tile_size: 64,
  tile_random: false,
  tta: 0,
  alpha: 0,
};

const STORAGE_KEY = 'waifu2x-react:preferences';

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Preferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota / privacy-mode errors
  }
}
