import { useCallback, useRef, useState } from 'react';
import { checkClipboardSupport, readImageFromClipboard, uuid } from '../lib/clipboard';
import { Button } from './ui/button';

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
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
        ${dragOver ? 'border-primary bg-accent/40' : 'border-border bg-muted/40 hover:bg-muted/60'}
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
        <img src={previewUrl} alt="preview" className="max-h-40 rounded-xl border border-border object-contain shadow-sm" />
      ) : (
        <div className="text-5xl">🌿</div>
      )}
      <p className="font-display text-lg font-medium text-foreground">
        {previewUrl ? 'Image loaded — click or drop to replace' : 'Set an image down here'}
      </p>
      <p className="text-sm text-muted-foreground">
        or click to browse{clipboardSupported ? ', or paste from clipboard' : ''}
      </p>
      {clipboardSupported && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            handlePaste();
          }}
        >
          Paste image
        </Button>
      )}
    </div>
  );
}
