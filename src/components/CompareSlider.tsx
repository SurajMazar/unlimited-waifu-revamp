import { useState } from 'react';

interface Props {
  beforeSrc: string;
  afterSrc: string;
  className?: string;
}

export function CompareSlider({ beforeSrc, afterSrc, className }: Props) {
  const [pos, setPos] = useState(50);

  return (
    <div className={`relative select-none overflow-hidden rounded-xl border border-border bg-muted ${className ?? ''}`}>
      <img src={afterSrc} alt="Upscaled result" className="block max-h-[420px] w-full object-contain" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={beforeSrc} alt="Original" className="block h-full max-h-[420px] w-full object-contain" draggable={false} />
      </div>

      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="h-full w-0.5 -translate-x-1/2 bg-card/90 shadow" />
        <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-xs shadow">
          ⇔
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Comparison slider"
        className="absolute inset-x-0 bottom-2 mx-auto w-11/12 accent-primary"
      />

      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-card/85 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
        Before
      </div>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-card/85 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
        After
      </div>
    </div>
  );
}
