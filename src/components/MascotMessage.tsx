import { motion, AnimatePresence } from 'framer-motion';
import type { MascotMood } from '../hooks/useWaifu2x';

const MOOD_STYLES: Record<MascotMood, string> = {
  idle: 'border-white/10 text-mist-300',
  happy: 'border-neon-cyan-soft/40 text-neon-cyan-soft',
  working: 'border-neon-pink/40 text-neon-pink-soft',
  error: 'border-rose-400/50 text-rose-300',
  done: 'border-neon-cyan-soft/50 text-neon-cyan-soft',
};

export function MascotMessage({ message, mood }: { message: string; mood: MascotMood }) {
  return (
    <div className="mx-auto flex max-w-xl justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className={`glass-panel rounded-2xl border px-5 py-3 text-center font-semibold ${MOOD_STYLES[mood]}`}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
