interface Props {
  running: boolean;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function ActionButtons({ running, canStart, onStart, onStop }: Props) {
  return (
    <div className="flex justify-center gap-4">
      <button
        type="button"
        disabled={!canStart || running}
        onClick={onStart}
        className="font-display rounded-full bg-sakura-500 px-8 py-2.5 text-lg font-bold text-white shadow-md transition-all hover:bg-sakura-600 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
      >
        ✨ Start
      </button>
      <button
        type="button"
        disabled={!running}
        onClick={onStop}
        className="font-display rounded-full bg-lavender-300 px-8 py-2.5 text-lg font-bold text-white shadow-md transition-all hover:bg-lavender-400 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
      >
        ⏹ Stop
      </button>
    </div>
  );
}
