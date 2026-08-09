import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
