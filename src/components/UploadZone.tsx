import { useCallback, useRef, useState } from 'react';
import { checkClipboardSupport, readImageFromClipboard, uuid } from '../lib/clipboard';

interface Props {
  previewUrl: string | null;
  disabled: boolean;
  onFile: (file: File) => void;
}

export function UploadZone({ previewUrl, disabled, onFile }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const clipboardSupported = checkClipboardSupport();

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (disabled || !files || files.length === 0) return;
      const f = files[0];
      if (f.type.match(/image/)) {
        onFile(f);
      }
    },
    [disabled, onFile]
  );

  const handlePaste = useCallback(async () => {
    if (disabled) return;
    const blob = await readImageFromClipboard();
    if (blob) {
      onFile(new File([blob], uuid(), { type: blob.type }));
    }
  }, [disabled, onFile]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`group relative flex flex-col items-center justify-center gap-3 rounded-3xl border-4 border-dashed p-6 text-center transition-all cursor-pointer select-none
        ${dragOver ? 'border-sakura-400 bg-sakura-100 scale-[1.02]' : 'border-sakura-200 bg-white/70 hover:bg-sakura-50'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="preview"
          className="max-h-40 rounded-2xl border-4 border-white shadow-md object-contain"
        />
      ) : (
        <div className="text-6xl animate-bob">🖼️</div>
      )}
      <p className="font-display font-bold text-sakura-600">
        {previewUrl ? 'Looking cute! Click or drop to change' : 'Drop your image here'}
      </p>
      <p className="text-xs text-lavender-400">or click to browse{clipboardSupported ? ' · or paste from clipboard' : ''}</p>
      {clipboardSupported && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            handlePaste();
          }}
          className="mt-1 rounded-full bg-lavender-100 px-4 py-1.5 text-sm font-semibold text-lavender-400 shadow-sm hover:bg-lavender-200 transition-colors disabled:opacity-50"
        >
          📋 Paste image
        </button>
      )}
    </div>
  );
}
