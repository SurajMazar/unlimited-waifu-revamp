const EMOJIS = ['🌸', '✨', '💮', '⭐'];

function seededPetals(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const left = (i * 37) % 100;
    const duration = 10 + ((i * 13) % 14);
    const delay = (i * 3) % 10;
    const size = 14 + ((i * 7) % 16);
    const emoji = EMOJIS[i % EMOJIS.length];
    return { left, duration, delay, size, emoji, id: i };
  });
}

const PETALS = seededPetals(16);

export function PetalBackground() {
  return (
    <div aria-hidden className="fixed inset-0 overflow-hidden">
      {PETALS.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
