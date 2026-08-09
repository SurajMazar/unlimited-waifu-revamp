import { motion } from 'framer-motion';

interface Props {
  running: boolean;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function ActionButtons({ running, canStart, onStart, onStop }: Props) {
  return (
    <div className="flex justify-center gap-4">
      <motion.button
        whileHover={!canStart || running ? undefined : { scale: 1.06 }}
        whileTap={!canStart || running ? undefined : { scale: 0.94 }}
        type="button"
        disabled={!canStart || running}
        onClick={onStart}
        className="font-display rounded-full bg-gradient-to-r from-neon-pink to-neon-violet px-8 py-2.5 text-lg font-bold text-ink-950 shadow-[0_0_30px_-8px_rgba(255,47,146,0.7)] transition-opacity disabled:opacity-40"
      >
        ✨ Start
      </motion.button>
      <motion.button
        whileHover={!running ? undefined : { scale: 1.06 }}
        whileTap={!running ? undefined : { scale: 0.94 }}
        type="button"
        disabled={!running}
        onClick={onStop}
        className="font-display rounded-full border border-white/15 bg-white/5 px-8 py-2.5 text-lg font-bold text-mist-100 transition-opacity disabled:opacity-40"
      >
        ⏹ Stop
      </motion.button>
    </div>
  );
}
