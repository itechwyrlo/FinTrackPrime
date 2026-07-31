import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update Service Worker
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'], // Files to cache
      manifest: {
        name: 'FinTrack Prime',
        short_name: 'FinTrack',
        description: 'Track accounts, budgets, cash flow, and premium planning tools in one place.',
        theme_color: '#111827', // ft-navy
        background_color: '#111827', // ft-navy — splash screen background
        display: 'standalone', // Makes it look like a native app (hides browser UI)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // extra padding so platform masking doesn't clip the mark
          },
        ],
      },
      workbox: {
        // Precache the built app shell (JS/CSS/HTML/fonts) so the app
        // loads and navigates offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // A navigation that misses the precache while offline (e.g. a
        // fresh deploy hasn't been cached yet) falls back to a static
        // offline page instead of a browser error screen.
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Financial data is never served from cache — a stale
            // balance shown as if live is worse than no data at all.
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        // Lets the manifest/service worker be verified via `npm run dev`,
        // not only a production build.
        enabled: true,
      },
    }),
  ],
})
