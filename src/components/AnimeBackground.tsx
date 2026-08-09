import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ORBS = [
  { left: 8, top: 6, size: 340, color: 'var(--color-neon-violet)' },
  { left: 78, top: 12, size: 300, color: 'var(--color-neon-cyan)' },
  { left: 55, top: 60, size: 420, color: 'var(--color-neon-pink)' },
  { left: 15, top: 72, size: 260, color: 'var(--color-neon-cyan)' },
  { left: 90, top: 80, size: 300, color: 'var(--color-neon-violet)' },
];

export function AnimeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      orbRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          x: `+=${30 + i * 8}`,
          y: `+=${-24 - i * 6}`,
          scale: 1.08,
          duration: 8 + i * 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      });

      const handleMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        gsap.to(containerRef.current, {
          x: nx * -24,
          y: ny * -24,
          duration: 1.2,
          ease: 'power2.out',
        });
      };
      window.addEventListener('mousemove', handleMove);
      return () => window.removeEventListener('mousemove', handleMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-[-5%]">
        <div className="grid-overlay absolute inset-0" />
        {ORBS.map((o, i) => (
          <span
            key={i}
            ref={(el) => {
              orbRefs.current[i] = el;
            }}
            className="orb"
            style={{
              left: `${o.left}%`,
              top: `${o.top}%`,
              width: o.size,
              height: o.size,
              background: o.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
