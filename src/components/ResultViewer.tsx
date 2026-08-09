import { useState, type RefObject } from 'react';
import { motion } from 'framer-motion';

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  resultUrl: string | null;
  downloadName: string;
  hasImage: boolean;
}

export function ResultViewer({ canvasRef, resultUrl, downloadName, hasImage }: Props) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="glass-panel glow-border flex flex-col items-center gap-3 rounded-3xl p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-mist-500">Result</p>
      <div className="w-full overflow-auto rounded-2xl border border-white/10 bg-[repeating-conic-gradient(#1b1733_0%_25%,#0c0a17_0%_50%)] bg-[length:20px_20px] shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={() => setZoomed((z) => !z)}
          className={`mx-auto block cursor-zoom-in transition-all ${
            zoomed ? 'max-w-none' : 'max-w-full max-h-[420px] object-contain'
          } ${!hasImage ? 'min-h-[128px] min-w-[128px]' : ''}`}
        />
      </div>
      {resultUrl ? (
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={resultUrl}
          download={downloadName}
          className="font-display rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet px-6 py-2 font-bold text-ink-950 shadow-[0_0_24px_-6px_rgba(47,227,255,0.7)]"
        >
          ⬇ Download PNG
        </motion.a>
      ) : (
        <p className="text-xs text-mist-500">Your upscaled image will appear here~</p>
      )}
    </div>
  );
}
