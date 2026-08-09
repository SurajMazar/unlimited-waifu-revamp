import { useMemo } from 'react';

// Slow, low-opacity environmental motion: drifting mist, fireflies, falling leaves.
// Intentionally understated — this should read as ambience, not decoration.

function seeded<T extends Record<string, number>>(count: number, fn: (i: number) => T) {
  return Array.from({ length: count }, (_, i) => ({ id: i, ...fn(i) }));
}

export function ForestAtmosphere({ variant = 'default' }: { variant?: 'default' | 'quiet' }) {
  const fireflies = useMemo(
    () =>
      seeded(variant === 'quiet' ? 5 : 9, (i) => ({
        left: (i * 23 + 7) % 100,
        top: 20 + ((i * 31) % 60),
        delay: (i * 0.7) % 4,
        duration: 3 + (i % 3),
      })),
    [variant]
  );

  const leaves = useMemo(
    () =>
      seeded(variant === 'quiet' ? 3 : 6, (i) => ({
        left: (i * 17 + 5) % 100,
        delay: i * 3.2,
        duration: 22 + (i % 5) * 4,
        size: 10 + (i % 3) * 4,
      })),
    [variant]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* soft layered light mimicking sunlight through canopy */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 20% -5%, rgba(217,194,120,0.18), transparent 60%), radial-gradient(50% 40% at 85% 10%, rgba(140,175,150,0.16), transparent 60%)',
        }}
      />
      <div className="grain-overlay absolute inset-0 opacity-60" />

      {leaves.map((l) => (
        <span
          key={`leaf-${l.id}`}
          className="animate-leaf-fall absolute text-forest-600/40"
          style={{
            left: `${l.left}%`,
            top: '-8%',
            fontSize: l.size,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
          }}
        >
          🍃
        </span>
      ))}

      {fireflies.map((f) => (
        <span
          key={`firefly-${f.id}`}
          className="animate-firefly absolute h-1.5 w-1.5 rounded-full bg-lantern-400 shadow-[0_0_8px_3px_rgba(217,154,61,0.55)]"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
