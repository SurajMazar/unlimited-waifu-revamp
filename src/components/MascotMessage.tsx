import type { MascotMood } from '../hooks/useWaifu2x';
import { cn } from '../lib/utils';

const MOOD_STYLES: Record<MascotMood, string> = {
  idle: 'border-border text-muted-foreground',
  happy: 'border-forest-600/25 text-forest-700 bg-moss-100/60',
  working: 'border-lantern-500/30 text-bark-700 bg-accent/40',
  error: 'border-destructive/30 text-destructive bg-destructive/5',
  done: 'border-forest-600/30 text-forest-700 bg-moss-100/70',
};

export function MascotMessage({ message, mood }: { message: string; mood: MascotMood }) {
  return (
    <div className={cn('mx-auto max-w-xl rounded-xl border px-5 py-3 text-center text-sm font-medium', MOOD_STYLES[mood])}>
      {message}
    </div>
  );
}
