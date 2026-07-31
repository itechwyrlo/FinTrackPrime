# Phase 4: PWA Infrastructure

Status: Approved for implementation
Date: 2026-07-31

## Context

Builds on Phases 1-3. `vite.config.ts` already references `vite-plugin-pwa`,
but the package isn't installed, and its manifest is unedited template
content ("My First PWA", white theme, icons that don't exist in `public/`).
`public/favicon.svg` is also unrelated template artwork (purple, not the
app's navy/gold brand) — left untouched here since fixing it isn't part of
PWA infrastructure, just noted so it isn't mistaken for the new icons.

This phase makes the app installable with correct branding, adds a
caching strategy appropriate for a financial app, and an offline
fallback. **No business logic, API, or routing changes.**

## Scope decisions

- **Offline data**: app shell only (static assets, so the app loads and
  navigates offline) — API responses are never cached. A financial app
  showing a stale balance without the user knowing it's stale is worse
  than showing nothing; `/api/*` gets an explicit Workbox `NetworkOnly`
  strategy rather than just omitting a cache rule, so the decision is
  visible in config, not implicit.
- **Icons**: generated fresh, on-brand (navy/gold), not derived from the
  existing unrelated favicon.svg.
- **iOS splash screens**: out of scope — Android/Chrome derive their
  splash screen from the manifest automatically (name + icon +
  background_color, already covered below); iOS's separate fixed-size
  splash-image requirement is a heavy asset-generation lift with low
  payoff here.
- **Background sync**: out of scope — there's no offline-writable
  mutation queue to sync (offline data entry isn't part of this app),
  so background sync would have nothing to do. Flagged as a future
  follow-up if offline transaction entry is ever wanted.

## Icon generation

- `public/pwa-icon.svg`: new, on-brand — navy (`#111827`) rounded-square
  background, gold (`#c5a059`) "FP" monogram.
- `sharp` added as a devDependency; a one-off script
  `scripts/generate-pwa-icons.mjs` rasterizes it to:
  - `public/pwa-192x192.png`
  - `public/pwa-512x512.png`
  - `public/pwa-maskable-512x512.png` (extra padding around the mark so
    the safe zone survives platform circle/squircle masking)
  - `public/apple-touch-icon.png` (180×180)
- The script stays in the repo (not a build step) so icons can be
  regenerated if the brand mark changes; it runs once now.

## `vite.config.ts`

- `VitePWA` manifest replaced with real branding: name "FinTrack Prime",
  short_name "FinTrack", description matching the app's actual purpose,
  `theme_color`/`background_color` `#111827` (`ft-navy`), `display:
  'standalone'`, icons pointing at the three generated PNGs (192, 512,
  512 maskable).
- `workbox.globPatterns` precaches the built JS/CSS/HTML/font assets
  (the app shell).
- `workbox.navigateFallback` set to `/offline.html` for navigations that
  miss the precache while offline.
- `workbox.runtimeCaching`: `NetworkOnly` strategy explicitly for
  `/api/*`, per the offline-data scope decision above.
- `devOptions.enabled: true` so the manifest/SW can be verified via
  `npm run dev`, not only a production build.
- `includeAssets` corrected to files that actually exist
  (`favicon.svg`, `robots.txt`, `apple-touch-icon.png`) — the current
  list references `favicon.ico` and `robots.txt`, neither of which
  exists.

## Offline fallback

- `public/offline.html`: a small hand-written, on-brand static page
  ("You're offline" + a reload button). Has to be static HTML, not a
  React route — Workbox's `navigateFallback` serves it when the actual
  navigation request fails over the network, before the SPA's own
  router ever runs.

## Install prompt

- `src/hooks/useInstallPrompt.ts`: captures `beforeinstallprompt`,
  exposes `isInstallable` and `promptInstall()`; clears itself on the
  `appinstalled` event.
- `TopNav` shows a small "Install app" `Button` next to the theme
  toggle when `isInstallable` is true, since the native browser install
  affordance is easy to miss.

## `index.html`

Adds `<meta name="theme-color" content="#111827">`,
`<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
`<meta name="apple-mobile-web-app-capable" content="yes">`,
`<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
— iOS doesn't fully honor the web manifest and needs these directly.

## `public/robots.txt`

Minimal file added (currently referenced by `includeAssets` but doesn't
exist).

## Out of scope

- Fixing/replacing the unrelated purple `favicon.svg`.
- Background sync, iOS splash screens, offline API-data caching (all
  decided above).
- Any change to `src/api/*.ts`, auth, or routing.
