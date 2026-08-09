import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🧠',
    title: '4 Model Architectures',
    body: 'SwinUNet (art, art-scan, photo) and the classic CUNet — pick the network trained for your image.',
  },
  {
    icon: '🩹',
    title: 'Seamless Tiling',
    body: 'Large images are split into tiles and stitched back together with cumulative seam blending — no visible borders.',
  },
  {
    icon: '🎯',
    title: 'TTA Ensemble',
    body: 'Optional test-time augmentation runs multiple flipped/rotated passes and merges them for cleaner results.',
  },
  {
    icon: '🔒',
    title: '100% Private',
    body: 'Every tensor operation happens in your browser via WebAssembly. Your image never leaves your device.',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-mist-100 sm:text-4xl">Built for real upscaling work</h2>
        <p className="mt-2 text-mist-500">Same engine as the original nunif/waifu2x — rebuilt from the ground up.</p>
      </motion.div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="glass-panel glow-border rounded-2xl p-5 text-left"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="font-display mt-3 text-lg font-bold text-mist-100">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist-500">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
