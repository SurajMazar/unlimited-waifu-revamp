import type { ReactNode } from 'react';
import { MODEL_OPTIONS, NOISE_OPTIONS, SCALE_OPTIONS, TILE_OPTIONS, TTA_OPTIONS } from '../lib/types';
import type { Preferences } from '../lib/preferences';

interface Props {
  prefs: Preferences;
  disabled: boolean;
  onChange: (patch: Partial<Preferences>) => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-mist-500">{label}</span>
      {children}
    </label>
  );
}

const selectClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-semibold text-mist-100 shadow-sm outline-none transition-colors focus:border-neon-pink/60 disabled:opacity-50';

export function ControlsPanel({ prefs, disabled, onChange }: Props) {
  const isSwin = prefs.model.startsWith('swin_unet');

  return (
    <div className="glass-panel grid grid-cols-1 gap-4 rounded-3xl p-5 sm:grid-cols-2">
      <Field label="Model">
        <select
          className={selectClass}
          disabled={disabled}
          value={prefs.model}
          onChange={(e) => {
            const model = e.target.value;
            const patch: Partial<Preferences> = { model };
            if (!model.startsWith('swin_unet') && prefs.scale === 4) {
              patch.scale = 2;
            }
            onChange(patch);
          }}
        >
          {MODEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-800">
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Denoise">
        <select
          className={selectClass}
          disabled={disabled}
          value={prefs.noise_level}
          onChange={(e) => onChange({ noise_level: Number(e.target.value) })}
        >
          {NOISE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-800">
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Upscale">
        <div className="flex items-center gap-2">
          <select
            className={selectClass}
            disabled={disabled}
            value={prefs.scale}
            onChange={(e) => onChange({ scale: Number(e.target.value) as 1 | 2 | 4 })}
          >
            {SCALE_OPTIONS.filter((o) => isSwin || o.value !== 4).map((o) => (
              <option key={o.value} value={o.value} className="bg-ink-800">
                {o.label}
              </option>
            ))}
          </select>
          {!isSwin && <span className="text-[11px] text-mist-500 whitespace-nowrap">no 4x</span>}
        </div>
      </Field>

      <Field label="Tile size">
        <div className="flex items-center gap-2">
          <select
            className={selectClass}
            disabled={disabled}
            value={prefs.tile_size}
            onChange={(e) => onChange({ tile_size: Number(e.target.value) })}
          >
            {TILE_OPTIONS.map((t) => (
              <option key={t} value={t} className="bg-ink-800">
                {t}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs font-semibold text-mist-500 whitespace-nowrap">
            <input
              type="checkbox"
              disabled={disabled}
              checked={prefs.tile_random}
              onChange={(e) => onChange({ tile_random: e.target.checked })}
              className="accent-neon-pink h-4 w-4"
            />
            Shuffle
          </label>
        </div>
      </Field>

      <Field label="TTA (ensemble)">
        <select
          className={selectClass}
          disabled={disabled}
          value={prefs.tta}
          onChange={(e) => onChange({ tta: Number(e.target.value) })}
        >
          {TTA_OPTIONS.map((t) => (
            <option key={t} value={t} className="bg-ink-800">
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Alpha channel">
        <select
          className={selectClass}
          disabled={disabled}
          value={prefs.alpha}
          onChange={(e) => onChange({ alpha: Number(e.target.value) })}
        >
          <option value={1} className="bg-ink-800">
            Auto
          </option>
          <option value={0} className="bg-ink-800">
            Disable
          </option>
        </select>
      </Field>
    </div>
  );
}
