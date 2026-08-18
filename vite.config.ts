import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative base path to support GitHub Pages, Cloudflare Pages, Vercel, and custom domains
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'canvas-confetti'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
