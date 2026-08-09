import { Button } from './ui/button';

interface Props {
  running: boolean;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function ActionButtons({ running, canStart, onStart, onStop }: Props) {
  return (
    <div className="flex justify-center gap-3">
      <Button size="lg" disabled={!canStart || running} onClick={onStart}>
        {running ? 'Working…' : 'Begin upscaling'}
      </Button>
      <Button size="lg" variant="outline" disabled={!running} onClick={onStop}>
        Stop
      </Button>
    </div>
  );
}
