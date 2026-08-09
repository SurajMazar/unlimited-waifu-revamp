import { motion, type Variants } from 'framer-motion';

interface Props {
  onLaunch: () => void;
}

const STATS = [
  { label: 'Runs on', value: 'Your GPU/CPU' },
  { label: 'Uploads', value: 'Zero — local only' },
  { label: 'Models', value: '4 architectures' },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Hero({ onLaunch }: Props) {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pt-16 text-center"
    >
      <div className="speed-lines absolute inset-x-0 top-1/3 h-64 -z-10" />

      <motion.span
        variants={item}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-neon-cyan-soft"
      >
        ⚡ Client-side AI upscaling
      </motion.span>

      <motion.h1 variants={item} className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl">
        <span className="text-glow-pink text-neon-pink">UNLIMITED</span>
        <br />
        <span className="text-glow-cyan text-neon-cyan">WAIFU2X</span>
      </motion.h1>

      <motion.p variants={item} className="mt-6 max-w-xl text-base text-mist-300 sm:text-lg">
        Upscale and denoise your art with the same neural nets behind waifu2x — running entirely in your
        browser via WebAssembly. No uploads, no server, no waiting in a queue.
      </motion.p>

      <motion.div variants={item} className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onLaunch}
          className="font-display relative rounded-full bg-gradient-to-r from-neon-pink via-neon-violet to-neon-cyan px-9 py-3.5 text-lg font-bold text-ink-950 shadow-[0_0_40px_-10px_rgba(255,47,146,0.8)]"
        >
          Launch the Upscaler ↓
        </motion.button>
        <motion.a
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          href="https://github.com/nagadomi/nunif"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-mist-300 transition-colors hover:border-neon-cyan-soft hover:text-neon-cyan-soft"
        >
          View the original project
        </motion.a>
      </motion.div>

      <motion.div variants={item} className="mt-14 grid w-full max-w-xl grid-cols-3 gap-3">
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -4, borderColor: 'rgba(155,92,255,0.6)' }}
            className="glass-panel rounded-2xl px-3 py-4"
          >
            <p className="font-display text-lg font-bold text-neon-violet-soft sm:text-xl">{s.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-mist-500">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={item}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 text-2xl text-mist-500"
      >
        ⌄
      </motion.div>
    </motion.section>
  );
}
