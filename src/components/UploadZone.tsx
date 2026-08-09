import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.01 }}
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
      className={`group relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer select-none
        ${dragOver ? 'border-neon-pink bg-white/[0.07]' : 'border-white/15 glass-panel hover:border-neon-violet/50'}
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
          className="max-h-40 rounded-2xl border border-white/10 shadow-lg object-contain"
        />
      ) : (
        <div className="text-6xl animate-bob">🖼️</div>
      )}
      <p className="font-display font-bold text-mist-100">
        {previewUrl ? 'Loaded — click or drop to swap' : 'Drop your image here'}
      </p>
      <p className="text-xs text-mist-500">or click to browse{clipboardSupported ? ' · or paste from clipboard' : ''}</p>
      {clipboardSupported && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            handlePaste();
          }}
          className="mt-1 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-mist-300 transition-colors hover:border-neon-cyan-soft hover:text-neon-cyan-soft disabled:opacity-50"
        >
          📋 Paste image
        </button>
      )}
    </motion.div>
  );
}
