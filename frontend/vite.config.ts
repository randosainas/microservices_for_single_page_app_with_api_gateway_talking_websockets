import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
  ],
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    https: false,
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["frontend"],
// this is a temp patch since the previous watch does not work no more.
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  resolve: {
    alias: {
      crypto: 'empty-module' as unknown as string, //Prevent Vite from polyfilling Node's crypto
    },
  },
});
