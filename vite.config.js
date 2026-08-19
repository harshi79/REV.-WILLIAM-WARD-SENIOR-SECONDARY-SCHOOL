import { defineConfig } from 'vite';

// base: './' makes the built site fully relative, so it works when hosted on
// GitHub Pages under a project sub-path (username.github.io/repo-name/).
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    target: 'es2019',
    outDir: 'dist',
  },
});
