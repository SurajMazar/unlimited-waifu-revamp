# Quiet Forest — unlimited:waifu2x (React rewrite)

A from-scratch React + TypeScript rewrite of the classic [unlimited:waifu2x](https://github.com/nagadomi/nunif)
browser app: a calm, Ghibli-inspired "quiet forest" exploration page at `/`, and a dedicated, minimal
upscaler workspace at `/upscaler`. Built with [shadcn/ui](https://ui.shadcn.com)-style components (Radix
primitives + Tailwind v4), Framer Motion for scroll reveals and gentle parallax, and plain CSS keyframes for
ambient motion (drifting fireflies, falling leaves, soft mist). All AI upscaling/denoising still runs
**entirely client-side** via [onnxruntime-web](https://onnxruntime.ai/docs/tutorials/web/) (WebAssembly) — no
server, no uploads, no backend required.

This is a faithful port of the original `script.js` engine (tiled rendering, seam blending, TTA ensemble,
alpha-channel handling, single-color tile shortcut, etc.) into typed modules under `src/lib/`.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the printed local URL. `/` is the exploration/landing page; `/upscaler` is the tool itself — drop
an image, pick your settings, hit **Begin upscaling**, and drag the before/after divider once it's done.

### UI components

`src/components/ui/` contains hand-authored shadcn/ui-style primitives (Button, Card, Select, Tabs, Dialog,
Progress, Slider, Switch, Badge, Separator, Tooltip, ScrollArea, Label) built on Radix UI primitives +
`class-variance-authority` + `tailwind-merge`, following the same pattern the shadcn CLI generates. They were
authored directly rather than pulled via `pnpm dlx shadcn@latest add ...` since the registry endpoint wasn't
reachable in the environment this was built in — functionally and structurally they're the same components,
just copy-pasted by hand. If you want to swap in the official CLI-managed versions later, `pnpm dlx
shadcn@latest add button card select ...` should work in a normal environment and will happily overwrite
these.

Theming lives in `src/index.css` as CSS variables (`--background`, `--primary`, `--muted`, etc.) mapped into
Tailwind's `@theme`, plus a handful of raw forest tokens (`--color-moss-500`, `--color-forest-700`,
`--color-bark-500`, `--color-lantern-500`) for one-off accents outside the shadcn token set.

### A note on onnxruntime-web + Vite

`onnxruntime-web`'s default export resolves to its self-contained "bundle" build, which is meant for plain
`<script>` tag usage — under a real bundler its internal worker bootstrapping breaks (`document is not
defined` inside the worker). `vite.config.ts` forces the `onnxruntime-web-use-extern-wasm` resolve condition
instead, which expects the wasm/worker runtime files to be served as static assets. Those are copied into
`public/ort/` (`ort.min.mjs`, `ort-wasm-simd-threaded.jsep.mjs/.wasm`) — if you ever upgrade
`onnxruntime-web`, re-copy those three files from `node_modules/onnxruntime-web/dist/`.

### Model files

The `.onnx` model weights (~300MB total) are **not** committed to this repo. They should already be copied
into `public/models/` for you (mirroring the original project's `models/` folder structure:
`models/swin_unet/...`, `models/cunet/...`, `models/utils/...`). If that folder is empty, copy it over from
the original project:

```bash
cp -R ../nunif-onnx-unlimited-waifu-seperated/old_html/public_html/models public/
```

## Scripts

- `pnpm dev` — start the Vite dev server
- `pnpm build` — type-check and build a production bundle to `dist/`
- `pnpm preview` — preview the production build locally
- `pnpm lint` — run oxlint

## Deploying to Vercel

This is a static SPA (Vite build), so it deploys to Vercel with zero config beyond what's already in
`vercel.json`:

- `outputDirectory: dist`
- Cross-Origin-Opener-Policy / Cross-Origin-Embedder-Policy headers, so the browser can use
  `SharedArrayBuffer` and onnxruntime-web can run multi-threaded WASM for faster inference.
- Long-lived cache headers for the `.onnx` model files and the `.wasm` runtime.

Just import the repo in Vercel (or run `vercel`), keep the framework preset as **Vite**, and make sure the
`public/models/` folder (or an equivalent asset host) is included in the deployment — see the note above,
since the model weights are excluded from git via `.gitignore` to keep the repo lightweight. If you'd rather
not ship 300MB of binaries in your deployment, consider hosting `models/` on a static CDN/object storage and
adjusting `CONFIG.get_config`'s `path` in `src/lib/config.ts` to point at the CDN URL instead.

## Project structure

```
src/
  lib/            # ported waifu2x/onnxruntime engine (framework-agnostic TypeScript)
    config.ts         # model/method config table (arch, tile-size rules, offsets...)
    onnxSession.ts     # InferenceSession cache
    seamBlending.ts    # cumulative tile seam/border blending
    imageUtils.ts      # tensor <-> ImageData conversions, tiling helpers
    onnxRunner.ts      # tiled_render pipeline (padding, TTA, alpha channel, inference)
    clipboard.ts       # paste-from-clipboard support
    preferences.ts     # localStorage-persisted UI preferences
    utils.ts           # cn() class-merging helper (shadcn convention)
  hooks/
    useWaifu2x.ts      # React hook wrapping the engine with UI state
  components/
    ui/                # shadcn/ui-style primitives (see note above)
    NavBar.tsx          # persistent top nav between the two pages
    ForestAtmosphere.tsx # ambient background: fireflies, falling leaves, soft light
    CompareSlider.tsx    # draggable before/after image comparison
    UploadZone.tsx, ControlsPanel.tsx, ActionButtons.tsx, ProgressBar.tsx,
    ResultViewer.tsx, MascotMessage.tsx  # the upscaler tool's building blocks
  pages/
    ForestHome.tsx     # the exploration/landing page ("/")
    UpscalerPage.tsx   # the dedicated tool workspace ("/upscaler")
public/
  models/              # ONNX model weights (see above)
  ort/                 # onnxruntime-web wasm/worker runtime (see note above)
```

## Credits

Original project: [nunif](https://github.com/nagadomi/nunif) by nagadomi, and
[waifu2x.udp.jp](https://waifu2x.udp.jp/).
