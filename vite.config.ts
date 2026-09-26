/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Base path : "/" en dev, "/<repo>/" quand on déploie sur GitHub Pages (variable BASE_PATH du workflow).
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        id: 'langue-app',
        name: 'Langue · Apprendre le thaï',
        short_name: 'Langue',
        description: "Un parcours guidé pour apprendre à parler, comprendre, lire et écrire le thaï.",
        lang: 'fr',
        dir: 'ltr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#E6EFEA',
        theme_color: '#0B6B5A',
        categories: ['education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tout le contenu pédagogique est dans le bundle : l'app fonctionne entièrement hors ligne.
        globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg,json}'],
        globIgnores: ['voices/**'], // les clips audio ne sont pas pré-installés : mis en cache à la première écoute (ou « Télécharger »)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          { urlPattern: /\/voices\/[mf]\/[0-9a-f]+\.mp3$/, handler: 'CacheFirst', options: { cacheName: 'voices', expiration: { maxEntries: 8000, maxAgeSeconds: 365 * 24 * 3600 }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: /\/voices\/manifest\.json$/, handler: 'NetworkFirst', options: { cacheName: 'voices-manifest' } },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/content/th/')) return 'content';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: false,
  },
});
