import { useCallback, useEffect, useRef, useState } from 'react';
import * as ort from 'onnxruntime-web';
import { CONFIG } from '../lib/config';
import { onnxRunner, checkAlphaChannel } from '../lib/onnxRunner';
import { decodeImage } from '../lib/imageUtils';
import { loadPreferences, savePreferences, type Preferences } from '../lib/preferences';
import type { Arch, Domain } from '../lib/types';

// We force Vite to resolve onnxruntime-web's "extern wasm" build (see vite.config.ts),
// which expects the wasm/worker runtime files to be served ourselves rather than
// bundled — they're copied into public/ort/ (see README for how to refresh them).
ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`;
// ORT's proxy worker stays off: under Vite it either fails to load its wasm loader or
// hangs mid-session, which is why it was disabled originally. Inference therefore runs
// on the main thread, so onnxRunner yields to the event loop between tiles to keep the
// page painting and interactive (see the yield in tiled_render).
ort.env.wasm.proxy = false;
if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
  // Threaded wasm only kicks in when the page is cross-origin isolated
  // (see the Cross-Origin-Opener/Embedder-Policy headers in vercel.json).
  ort.env.wasm.numThreads = crossOriginIsolated ? Math.min(navigator.hardwareConcurrency, 8) : 1;
}

export type MascotMood = 'idle' | 'happy' | 'working' | 'error' | 'done';

export interface Waifu2xState {
  prefs: Preferences;
  file: File | null;
  previewUrl: string | null;
  resultUrl: string | null;
  running: boolean;
  progress: number;
  maxProgress: number;
  message: string;
  mood: MascotMood;
}

function resolveMethod(scale: 1 | 2 | 4, noise_level: number): { method: string | null; error: string | null } {
  if (scale === 1) {
    if (noise_level === -1) {
      return { method: null, error: 'Choose a denoise level to continue.' };
    }
    return { method: `noise${noise_level}`, error: null };
  }
  const suffix = `scale${scale}x`;
  if (noise_level === -1) {
    return { method: suffix, error: null };
  }
  return { method: `noise${noise_level}_${suffix}`, error: null };
}

export interface ImageDims {
  width: number;
  height: number;
}

export function useWaifu2x(outputCanvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [prefs, setPrefsState] = useState<Preferences>(() => loadPreferences());
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sourceDims, setSourceDims] = useState<ImageDims | null>(null);
  const [resultDims, setResultDims] = useState<ImageDims | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);
  const [message, setMessage] = useState('Bring an image, and the workshop will begin.');
  const [mood, setMood] = useState<MascotMood>('idle');
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const setPrefs = useCallback((patch: Partial<Preferences>) => {
    setPrefsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const loadFile = useCallback((f: File) => {
    if (onnxRunner.running) return;
    setFile(f);
    setResultUrl(null);
    setResultDims(null);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreviewUrl(url);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setSourceDims({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    };
    reader.readAsDataURL(f);
    setMessage('Image received. Choose your settings, then begin.');
    setMood('happy');
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setSourceDims(null);
    setResultDims(null);
    imgRef.current = null;
    setMessage('Bring an image, and the workshop will begin.');
    setMood('idle');
  }, []);

  const stop = useCallback(() => {
    onnxRunner.stop_flag = true;
  }, []);

  const start = useCallback(async () => {
    if (onnxRunner.running) return;
    if (!file || !imgRef.current) {
      setMessage('Bring an image first — drop one in above.');
      setMood('error');
      return;
    }
    const [archStr, domainStr] = prefs.model.split('.') as [Arch, Domain];
    const { method, error } = resolveMethod(prefs.scale, prefs.noise_level);
    if (error || !method) {
      setMessage(error ?? 'Something in the settings needs a second look.');
      setMood('error');
      return;
    }
    const config = CONFIG.get_config(archStr, domainStr, method);
    if (!config) {
      setMessage('That model could not be found.');
      setMood('error');
      return;
    }
    const tile_size = config.calc_tile_size(prefs.tile_size, config);

    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const image_data = decodeImage(imgRef.current);
    const alpha_enabled = prefs.alpha === 1;
    const has_alpha = alpha_enabled ? checkAlphaChannel(image_data.data) : false;

    let alpha_config = null;
    if (has_alpha) {
      let alpha_method: string;
      if (method.includes('scale2x')) alpha_method = 'scale2x';
      else if (method.includes('scale4x')) alpha_method = 'scale4x';
      else alpha_method = 'scale1x';
      alpha_config = CONFIG.get_config(archStr, domainStr, alpha_method);
      if (!alpha_config) {
        setMessage('The matching alpha-channel model could not be found.');
        setMood('error');
        return;
      }
    }

    setRunning(true);
    setMood('working');
    setMessage('Working through the tiles, one by one...');
    setResultUrl(null);
    setResultDims(null);
    setProgress(0);
    setMaxProgress(0);

    try {
      await onnxRunner.tiled_render(
        image_data,
        config,
        alpha_config,
        prefs.tta,
        tile_size,
        prefs.tile_random,
        canvas,
        (p, max, processing) => {
          setProgress(p);
          setMaxProgress(max);
          if (processing) {
            setMessage(`Upscaling — tile ${p} of ${max}...`);
          }
        }
      );
      if (!onnxRunner.stop_flag) {
        setResultDims({ width: canvas.width, height: canvas.height });
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setResultUrl(url);
          setMessage('Done. Your image has been restored.');
          setMood('done');
        }, 'image/png');
      } else {
        setMessage('Stopped.');
        setMood('idle');
      }
    } catch (e) {
      console.error(e);
      setMessage('Something went wrong: ' + (e as Error).message);
      setMood('error');
    } finally {
      setRunning(false);
    }
  }, [file, prefs, outputCanvasRef]);

  return {
    prefs,
    setPrefs,
    file,
    previewUrl,
    resultUrl,
    sourceDims,
    resultDims,
    running,
    progress,
    maxProgress,
    message,
    mood,
    loadFile,
    clearFile,
    start,
    stop,
    downloadName: file ? file.name.replace(/\.[^.]+$/, '') + `_waifu2x.png` : 'waifu2x.png',
  };
}
