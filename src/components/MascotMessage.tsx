import type { MascotMood } from '../hooks/useWaifu2x';

const MOOD_STYLES: Record<MascotMood, string> = {
  idle: 'bg-lavender-100 text-lavender-400 border-lavender-200',
  happy: 'bg-mint-100 text-emerald-600 border-mint-200',
  working: 'bg-sakura-100 text-sakura-600 border-sakura-200',
  error: 'bg-rose-100 text-rose-500 border-rose-200',
  done: 'bg-mint-100 text-emerald-600 border-mint-300',
};

export function MascotMessage({ message, mood }: { message: string; mood: MascotMood }) {
  return (
    <div
      className={`mx-auto max-w-xl rounded-2xl border-2 px-5 py-3 text-center font-semibold shadow-sm transition-colors duration-300 animate-pop-in ${MOOD_STYLES[mood]}`}
    >
      {message}
    </div>
  );
}
