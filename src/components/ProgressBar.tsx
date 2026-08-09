export function ProgressBar({ progress, max, active }: { progress: number; max: number; active: boolean }) {
  if (!active || max === 0) return null;
  const pct = Math.min(100, Math.round((progress / max) * 100));
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="h-4 w-full overflow-hidden rounded-full border-2 border-sakura-200 bg-white">
        <div
          className="shimmer-bg h-full rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-center text-xs font-semibold text-lavender-400">
        {progress} / {max} tiles ({pct}%)
      </p>
    </div>
  );
}
