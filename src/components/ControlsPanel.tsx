import type { ReactNode } from 'react';
import { MODEL_OPTIONS, NOISE_OPTIONS, SCALE_OPTIONS, TILE_OPTIONS, TTA_OPTIONS } from '../lib/types';
import type { Preferences } from '../lib/preferences';
import { Label } from './ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Switch } from './ui/switch';

interface Props {
  prefs: Preferences;
  disabled: boolean;
  onChange: (patch: Partial<Preferences>) => void;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function ControlsPanel({ prefs, disabled, onChange }: Props) {
  const isSwin = prefs.model.startsWith('swin_unet');

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Model">
        <Select
          disabled={disabled}
          value={prefs.model}
          onValueChange={(model) => {
            const patch: Partial<Preferences> = { model };
            if (!model.startsWith('swin_unet') && prefs.scale === 4) patch.scale = 2;
            onChange(patch);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Denoise">
        <Select disabled={disabled} value={String(prefs.noise_level)} onValueChange={(v) => onChange({ noise_level: Number(v) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOISE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={String(o.value)}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Upscale factor">
        <Select
          disabled={disabled}
          value={String(prefs.scale)}
          onValueChange={(v) => onChange({ scale: Number(v) as 1 | 2 | 4 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCALE_OPTIONS.filter((o) => isSwin || o.value !== 4).map((o) => (
              <SelectItem key={o.value} value={String(o.value)}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Tile size">
        <Select disabled={disabled} value={String(prefs.tile_size)} onValueChange={(v) => onChange({ tile_size: Number(v) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TILE_OPTIONS.map((t) => (
              <SelectItem key={t} value={String(t)}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="TTA ensemble">
        <Select disabled={disabled} value={String(prefs.tta)} onValueChange={(v) => onChange({ tta: Number(v) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TTA_OPTIONS.map((t) => (
              <SelectItem key={t} value={String(t)}>
                {t === 0 ? 'Off' : `${t} passes`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Alpha channel" htmlFor="alpha-toggle">
        <div className="flex h-10 items-center gap-3">
          <Switch
            id="alpha-toggle"
            disabled={disabled}
            checked={prefs.alpha === 1}
            onCheckedChange={(checked) => onChange({ alpha: checked ? 1 : 0 })}
          />
          <span className="text-sm text-muted-foreground">{prefs.alpha === 1 ? 'Auto-detect transparency' : 'Disabled'}</span>
        </div>
      </Field>

      <Field label="Tile order">
        <div className="flex h-10 items-center gap-3">
          <Switch
            disabled={disabled}
            checked={prefs.tile_random}
            onCheckedChange={(checked) => onChange({ tile_random: checked })}
          />
          <span className="text-sm text-muted-foreground">{prefs.tile_random ? 'Shuffled' : 'In order'}</span>
        </div>
      </Field>
    </div>
  );
}
