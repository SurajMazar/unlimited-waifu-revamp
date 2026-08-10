import { createReadStream, existsSync } from 'node:fs'
import { join, normalize } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// onnxruntime-web dynamically imports its wasm loader from public/ort/. Vite's dev
// import-analysis middleware intercepts that request, appends `?import`, and then
// refuses it ("This file is in /public ... should not be imported from source code"),
// so inference fails with "no available backend found" in dev while working fine in
// production (where the files are just static assets). Serve /ort/* ourselves, ahead
// of Vite's internal middlewares, so it behaves the same in both.
function serveOrtAssets(): Plugin {
  const TYPES: Record<string, string> = {
    '.mjs': 'text/javascript',
    '.js': 'text/javascript',
    '.wasm': 'application/wasm',
  }
  return {
    name: 'serve-ort-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        if (!path.startsWith('/ort/')) return next()
        // normalize() collapses any ../ before we touch the filesystem
        const file = join(server.config.publicDir, normalize(path).replace(/^\/+/, ''))
        if (!file.startsWith(server.config.publicDir) || !existsSync(file)) return next()
        const ext = path.slice(path.lastIndexOf('.'))
        if (TYPES[ext]) res.setHeader('Content-Type', TYPES[ext])
        createReadStream(file).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [serveOrtAssets(), react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    // NOTE: deliberately not mirroring vercel.json's Cross-Origin-Opener/Embedder-Policy
    // headers here. They would make dev cross-origin isolated, which flips
    // onnxruntime-web to multi-threaded wasm — and its pthread workers hang under Vite's
    // dev server. Dev therefore runs single-threaded (slower than production, but it
    // actually completes); production still gets the threaded path via vercel.json.
  },
  // onnxruntime-web's default export resolves to its self-contained "bundle" build,
  // which is meant for plain <script> tag usage and manages its own worker/wasm
  // loading via tricks that break once a real bundler (Rollup/Vite) processes it
  // (the worker ends up re-executing the whole app chunk -> "document is not defined").
  // Forcing this custom export condition makes it resolve to the "extern wasm" build
  // instead, which expects us to serve the wasm/worker files ourselves (see public/ort
  // and wasmPaths in src/hooks/useWaifu2x.ts).
  resolve: {
    conditions: ['onnxruntime-web-use-extern-wasm'],
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
  build: {
    target: 'esnext',
  },
})
