import { useCallback, useEffect, useRef, useState } from 'react';
import * as ort from 'onnxruntime-web';
import { CONFIG } from '../lib/config';
import { onnxRunner, checkAlphaChannel } from '../lib/onnxRunner';
import { decodeImage } from '../lib/imageUtils';
import { loadPreferences, savePreferences, type Preferences } from '../lib/preferences';
import type { Arch, Domain } from '../lib/types';

// Vite resolves onnxruntime-web's wasm binaries automatically via import.meta.url,
// so no manual wasmPaths configuration is needed here.
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
      return { method: null, error: 'Pick a denoise level first, senpai~ (；一_一)' };
    }
    return { method: `noise${noise_level}`, error: null };
  }
  const suffix = `scale${scale}x`;
  if (noise_level === -1) {
    return { method: suffix, error: null };
  }
  return { method: `noise${noise_level}_${suffix}`, error: null };
}

export function useWaifu2x(outputCanvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [prefs, setPrefsState] = useState<Preferences>(() => loadPreferences());
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);
  const [message, setMessage] = useState('Drop a picture on me, onegai! (・∀・)');
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
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreviewUrl(url);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
      };
      img.src = url;
    };
    reader.readAsDataURL(f);
    setMessage('Got it! Ready when you are (｡・∀・)ﾉﾞ');
    setMood('happy');
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    imgRef.current = null;
    setMessage('Drop a picture on me, onegai! (・∀・)');
    setMood('idle');
  }, []);

  const stop = useCallback(() => {
    onnxRunner.stop_flag = true;
  }, []);

  const start = useCallback(async () => {
    if (onnxRunner.running) return;
    if (!file || !imgRef.current) {
      setMessage('No image found yet (ﾟ∀ﾟ)');
      setMood('error');
      return;
    }
    const [archStr, domainStr] = prefs.model.split('.') as [Arch, Domain];
    const { method, error } = resolveMethod(prefs.scale, prefs.noise_level);
    if (error || !method) {
      setMessage(error ?? 'Something is off with the settings (・A・)');
      setMood('error');
      return;
    }
    const config = CONFIG.get_config(archStr, domainStr, method);
    if (!config) {
      setMessage('Model not found! (・A・)');
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
        setMessage('Alpha model not found! (・A・)');
        setMood('error');
        return;
      }
    }

    setRunning(true);
    setMood('working');
    setMessage('Working my magic... (・∀・)φ');
    setResultUrl(null);
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
            setMessage(`Upscaling... (${p}/${max}) (・∀・)φ`);
          }
        }
      );
      if (!onnxRunner.stop_flag) {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setResultUrl(url);
          setMessage("All done, here's your art! (ﾉ・∀・)ﾉ゛");
          setMood('done');
        }, 'image/png');
      } else {
        setMessage('Stopped! (・A・)');
        setMood('idle');
      }
    } catch (e) {
      console.error(e);
      setMessage('Oops, something broke: ' + (e as Error).message);
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
