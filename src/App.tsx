import { useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PetalBackground } from './components/PetalBackground';
import { MascotMessage } from './components/MascotMessage';
import { UploadZone } from './components/UploadZone';
import { ControlsPanel } from './components/ControlsPanel';
import { ActionButtons } from './components/ActionButtons';
import { ProgressBar } from './components/ProgressBar';
import { ResultViewer } from './components/ResultViewer';
import { useWaifu2x } from './hooks/useWaifu2x';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
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
    start,
    stop,
    downloadName,
  } = useWaifu2x(canvasRef);

  return (
    <div className="relative min-h-screen">
      <PetalBackground />
      <div className="relative z-10">
        <Header />

        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-16">
          <MascotMessage message={message} mood={mood} />

          <UploadZone previewUrl={previewUrl} disabled={running} onFile={loadFile} />

          <ControlsPanel prefs={prefs} disabled={running} onChange={setPrefs} />

          <ActionButtons running={running} canStart={!!file} onStart={start} onStop={stop} />

          <ProgressBar progress={progress} max={maxProgress} active={running} />

          <ResultViewer canvasRef={canvasRef} resultUrl={resultUrl} downloadName={downloadName} hasImage={!!file} />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
