import { useState, type RefObject } from 'react';

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  resultUrl: string | null;
  downloadName: string;
  hasImage: boolean;
}

export function ResultViewer({ canvasRef, resultUrl, downloadName, hasImage }: Props) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 p-5 shadow-sm border-2 border-mint-200">
      <p className="text-xs font-bold uppercase tracking-wide text-lavender-400">Result</p>
      <div className="w-full overflow-auto rounded-2xl border-4 border-white bg-[repeating-conic-gradient(#f3f3f3_0%_25%,white_0%_50%)] bg-[length:20px_20px] shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={() => setZoomed((z) => !z)}
          className={`mx-auto block cursor-zoom-in transition-all ${
            zoomed ? 'max-w-none' : 'max-w-full max-h-[420px] object-contain'
          } ${!hasImage ? 'min-h-[128px] min-w-[128px]' : ''}`}
        />
      </div>
      {resultUrl ? (
        <a
          href={resultUrl}
          download={downloadName}
          className="font-display rounded-full bg-mint-200 px-6 py-2 font-bold text-emerald-700 shadow-sm transition-all hover:bg-mint-300 hover:scale-105"
        >
          ⬇ Download PNG
        </a>
      ) : (
        <p className="text-xs text-lavender-400">Your upscaled image will appear here~</p>
      )}
    </div>
  );
}
