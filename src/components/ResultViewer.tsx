import type { RefObject } from 'react';
import { CompareSlider } from './CompareSlider';
import { Button } from './ui/button';
import type { ImageDims } from '../hooks/useWaifu2x';

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  previewUrl: string | null;
  resultUrl: string | null;
  sourceDims: ImageDims | null;
  resultDims: ImageDims | null;
  downloadName: string;
  hasImage: boolean;
}

export function ResultViewer({ canvasRef, previewUrl, resultUrl, sourceDims, resultDims, downloadName, hasImage }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* The canvas is the actual render target for the engine; kept off-screen once
          we have a comparable result image, but always mounted so refs stay valid. */}
      <canvas ref={canvasRef} className="hidden" />

      {resultUrl && previewUrl ? (
        <CompareSlider beforeSrc={previewUrl} afterSrc={resultUrl} className="w-full" />
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          {hasImage ? 'Your result will appear here once processing finishes.' : 'Nothing to show yet — bring an image above.'}
        </div>
      )}

      {(sourceDims || resultDims) && (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
          {sourceDims && (
            <span>
              Original: {sourceDims.width}×{sourceDims.height}px
            </span>
          )}
          {resultDims && (
            <span>
              Result: {resultDims.width}×{resultDims.height}px
            </span>
          )}
        </div>
      )}

      {resultUrl ? (
        <Button asChild>
          <a href={resultUrl} download={downloadName}>
            Download PNG
          </a>
        </Button>
      ) : null}
    </div>
  );
}
