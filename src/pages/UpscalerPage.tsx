import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { MascotMessage } from '../components/MascotMessage';
import { UploadZone } from '../components/UploadZone';
import { ControlsPanel } from '../components/ControlsPanel';
import { ActionButtons } from '../components/ActionButtons';
import { ProgressBar } from '../components/ProgressBar';
import { ResultViewer } from '../components/ResultViewer';
import { useWaifu2x } from '../hooks/useWaifu2x';

export function UpscalerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
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
    start,
    stop,
    downloadName,
  } = useWaifu2x(canvasRef);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-moss-500">The Workshop</p>
        <h1 className="font-display text-3xl font-semibold text-forest-800 sm:text-4xl">The Upscaler</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          A small, focused workspace. Bring an image, choose your settings, and let it work.
        </p>
      </div>

      <div className="mb-6">
        <MascotMessage message={message} mood={mood} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Image &amp; Settings</CardTitle>
            <CardDescription>Drag a picture in, then tune how it should be restored.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <UploadZone previewUrl={previewUrl} disabled={running} onFile={loadFile} />
            <ControlsPanel prefs={prefs} disabled={running} onChange={setPrefs} />
            <ActionButtons running={running} canStart={!!file} onStart={start} onStop={stop} />
            <ProgressBar progress={progress} max={maxProgress} active={running} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Result</CardTitle>
            <CardDescription>Drag the divider to compare the original against the upscaled version.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResultViewer
              canvasRef={canvasRef}
              previewUrl={previewUrl}
              resultUrl={resultUrl}
              sourceDims={sourceDims}
              resultDims={resultDims}
              downloadName={downloadName}
              hasImage={!!file}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
