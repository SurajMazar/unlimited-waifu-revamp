import { useRef } from 'react';
import { motion } from 'framer-motion';
import { AnimeBackground } from './components/AnimeBackground';
import { Hero } from './components/Hero';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { MascotMessage } from './components/MascotMessage';
import { UploadZone } from './components/UploadZone';
import { ControlsPanel } from './components/ControlsPanel';
import { ActionButtons } from './components/ActionButtons';
import { ProgressBar } from './components/ProgressBar';
import { ResultViewer } from './components/ResultViewer';
import { useWaifu2x } from './hooks/useWaifu2x';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);
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

  const scrollToApp = () => {
    appSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen">
      <AnimeBackground />
      <div className="relative z-10">
        <Hero onLaunch={scrollToApp} />
        <FeaturesSection />

        <motion.section
          ref={appSectionRef}
          id="app"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl scroll-mt-8 flex-col gap-6 px-4 pb-24 pt-6"
        >
          <div className="mb-2 text-center">
            <h2 className="font-display text-3xl font-bold text-mist-100 sm:text-4xl">The Upscaler</h2>
            <p className="mt-1 text-sm text-mist-500">Drop an image, tune the settings, and hit start.</p>
          </div>

          <MascotMessage message={message} mood={mood} />

          <UploadZone previewUrl={previewUrl} disabled={running} onFile={loadFile} />

          <ControlsPanel prefs={prefs} disabled={running} onChange={setPrefs} />

          <ActionButtons running={running} canStart={!!file} onStart={start} onStop={stop} />

          <ProgressBar progress={progress} max={maxProgress} active={running} />

          <ResultViewer canvasRef={canvasRef} resultUrl={resultUrl} downloadName={downloadName} hasImage={!!file} />
        </motion.section>

        <Footer />
      </div>
    </div>
  );
}

export default App;
