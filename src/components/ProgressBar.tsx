import { Progress } from './ui/progress';

export function ProgressBar({ progress, max, active }: { progress: number; max: number; active: boolean }) {
  if (!active || max === 0) return null;
  const pct = Math.min(100, Math.round((progress / max) * 100));
  return (
    <div className="mx-auto w-full max-w-md">
      <Progress value={pct} />
      <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">
        Tile {progress} of {max} ({pct}%)
      </p>
    </div>
  );
}
