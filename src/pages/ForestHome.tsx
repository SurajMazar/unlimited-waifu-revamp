import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const WAYPOINTS = [
  {
    title: 'Four Paths Through the Woods',
    body: 'SwinUNet (art, art-scan, photo) and the classic CUNet — four trained networks, each suited to a different kind of image.',
    icon: '🌲',
  },
  {
    title: 'Seamless Ground',
    body: 'Large images are split into tiles and rejoined with cumulative seam blending, so no border ever shows through.',
    icon: '🪵',
  },
  {
    title: 'A Steadier Eye',
    body: 'Optional test-time augmentation studies your image from several angles and blends the results for a cleaner outcome.',
    icon: '🔦',
  },
  {
    title: 'Nothing Leaves the Clearing',
    body: 'Every computation happens on your own device via WebAssembly. Your images are never uploaded anywhere.',
    icon: '🏡',
  },
];

export function ForestHome() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const mistY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative">
      {/* The Clearing */}
      <section ref={heroRef} className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <motion.div
          style={{ y: mistY }}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
        >
          <div className="h-full w-full bg-gradient-to-t from-moss-300/50 via-moss-100/25 to-transparent blur-2xl" />
        </motion.div>

        <motion.div style={{ y: titleY, opacity: fade }} className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <Badge variant="outline" className="mb-6 border-forest-600/30 bg-card/70 text-forest-700">
              🍂 a quiet corner of the internet
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
            className="font-display max-w-3xl text-5xl font-semibold leading-tight text-forest-800 sm:text-6xl"
          >
            A quiet forest, and a lantern for your old photographs
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Wander a little way in, and you'll find a small workshop tucked among the trees — a place that
            gently restores and upscales your art and photos, entirely on your own device.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.45 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg">
              <Link to="/upscaler">Follow the path to the workshop →</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com/nagadomi/nunif" target="_blank" rel="noreferrer">
                Read about the craft
              </a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 text-muted-foreground"
        >
          ⌄
        </motion.div>
      </section>

      {/* The Old Workshop */}
      <section className="relative mx-auto max-w-5xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-moss-500">Along the path</p>
          <h2 className="font-display text-3xl font-semibold text-forest-800 sm:text-4xl">What you'll find here</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {WAYPOINTS.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-1 text-2xl">{w.icon}</div>
                  <CardTitle>{w.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[0.95rem] leading-relaxed">{w.body}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-xl bg-border/70" />

      {/* The Lantern Path */}
      <section className="relative mx-auto max-w-2xl px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-3xl font-semibold text-forest-800 sm:text-4xl">
            When you're ready, the lanterns will guide you in
          </h2>
          <p className="mt-4 text-muted-foreground">
            No sign-ups, no uploads, no waiting rooms — just bring an image, and the workshop will do the rest.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/upscaler">Enter the workshop</Link>
          </Button>
        </motion.div>
      </section>

      <footer className="relative pb-10 text-center text-xs text-muted-foreground">
        <p>
          Powered by{' '}
          <a className="underline hover:text-forest-700" href="https://github.com/nagadomi/nunif" target="_blank" rel="noreferrer">
            nunif/waifu2x
          </a>{' '}
          · a quiet React rewrite
        </p>
      </footer>
    </div>
  );
}
