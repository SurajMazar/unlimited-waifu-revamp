# unlimited:waifu2x ✨ (React rewrite)

A from-scratch React + TypeScript rewrite of the classic [unlimited:waifu2x](https://github.com/nagadomi/nunif)
browser app, with a soft pastel "kawaii" anime UI. All AI upscaling/denoising still runs **entirely client-side**
in the browser via [onnxruntime-web](https://onnxruntime.ai/docs/tutorials/web/) (WebAssembly) — no server, no
uploads, no backend required.

This is a faithful port of the original `script.js` engine (tiled rendering, seam blending, TTA ensemble,
alpha-channel handling, single-color tile shortcut, etc.) into typed modules under `src/lib/`, wired up to a
new React UI under `src/components/`.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the printed local URL. Drop an image, pick a model/denoise/scale, hit **Start**.

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
  hooks/
    useWaifu2x.ts      # React hook wrapping the engine with UI state
  components/          # kawaii pastel UI components
public/
  models/              # ONNX model weights (see above)
```

## Credits

Original project: [nunif](https://github.com/nagadomi/nunif) by nagadomi, and
[waifu2x.udp.jp](https://waifu2x.udp.jp/).
