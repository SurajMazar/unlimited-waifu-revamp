import { motion, AnimatePresence } from 'framer-motion';

export function ProgressBar({ progress, max, active }: { progress: number; max: number; active: boolean }) {
  const pct = max > 0 ? Math.min(100, Math.round((progress / max) * 100)) : 0;
  return (
    <AnimatePresence>
      {active && max > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mx-auto w-full max-w-md overflow-hidden"
        >
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
            <motion.div
              className="shimmer-bg h-full rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="mt-1 text-center text-xs font-semibold text-mist-500">
            {progress} / {max} tiles ({pct}%)
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
