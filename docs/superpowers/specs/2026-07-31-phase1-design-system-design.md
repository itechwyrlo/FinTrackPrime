# Phase 1: Design System + Shared Component Library

Status: Approved for planning
Date: 2026-07-31

## Context

FinTrack Prime's frontend (React 19 + TypeScript + Vite + Tailwind CSS v4 +
TanStack Query + Recharts) is getting a full UI redesign toward a premium
SaaS-quality financial dashboard (Stripe/Linear/Vercel-tier), across four
sequential phases:

1. **Design system + shared component library** (this spec)
2. App shell (collapsible/responsive sidebar, top nav, breadcrumbs)
3. Page-by-page redesign (Dashboard, Budget Planner, Cash Flow, Loan
   Calculator, Investment Tracker, Retirement Planner, Financial Statement,
   Login/Register, Upgrade)
4. PWA infrastructure (manifest, service worker, offline fallback, icons)

Today the app has almost no shared UI layer: two components
(`TextField`, `GuillocheMotif`) and every page hand-rolls its own buttons,
inputs, cards, and status text directly in Tailwind classes. There is no
dark mode, no skeleton/spinner system, no accessible modal/dropdown/tabs
primitives, and no icon library (raw emoji are used ad hoc, e.g. 🔒 ✓).

This phase builds the token layer and component library that Phases 2-3
will consume. **It does not touch any existing page, the sidebar, or
routing** — it is purely additive so it can be built and verified in
isolation before anything depends on it.

## Goals

- A themeable (light/dark) design-token layer built on top of the existing
  brand palette, which is preserved exactly as-is.
- A library of ~24 accessible, responsive, reusable UI primitives under
  `src/components/ui/`, each independently responsive (not reliant on a
  parent container's breakpoint) per the project's cascading-responsiveness
  requirement.
- A light/dark theme toggle mechanism (context + persisted preference).
- A consistent icon system (lucide-react) replacing ad hoc emoji.
- A chart color-token system (categorical/sequential/diverging/status)
  validated for colorblind-safety and contrast, ready for Phase 3's charts.
- A way to visually verify every component/state without a backend
  (a dev-only style guide route), since this repo has no test framework.

## Non-goals (explicitly out of scope for this phase)

- Rewiring any existing page to use the new components (Phase 3).
- Sidebar/top-nav redesign (Phase 2).
- PWA/service worker/manifest work (Phase 4).
- Changing any business logic, API calls, routing, or auth behavior.
- Changing the brand color values (`ft-blue`, `ft-gold`, `ft-gold-dark`,
  `ft-gold-ink`, `ft-navy`, `ft-off-white`) — they carry over unchanged.

## New dependencies

- `lucide-react` — tree-shakeable icon set.
- `@radix-ui/react-dialog`, `-dropdown-menu`, `-tabs`, `-accordion`,
  `-toast`, `-tooltip`, `-slider`, `-select`, `-switch`, `-avatar`,
  `-progress` — unstyled accessible primitives, skinned with Tailwind to
  match the navy/gold theme. Chosen over hand-rolled implementations
  because correct focus-trapping/ARIA/keyboard behavior is easy to get
  wrong from scratch and Radix is the standard choice for this class of
  app.

No new dependency is added for grid/layout (Tailwind's native grid/flex
utilities cover the responsive grid system) or for skeleton shimmer
(pure CSS `@keyframes`, no library needed).

## Design tokens (`src/index.css`)

### Brand tokens — unchanged

`--color-ft-blue`, `--color-ft-gold`, `--color-ft-gold-dark`,
`--color-ft-gold-ink`, `--color-ft-navy`, `--color-ft-off-white`,
`--font-display`, `--font-body` all carry over byte-for-byte from the
current `@theme` block.

### Dark mode mechanism

Class-based, via Tailwind v4's `@custom-variant`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

`ThemeContext` (`src/context/ThemeContext.tsx`) exposes `theme` and
`toggleTheme()`:
- On first load: reads `localStorage['ft-theme']`; if absent, falls back
  to `window.matchMedia('(prefers-color-scheme: dark)')`.
- `toggleTheme()` flips the theme, writes it to `localStorage`, and
  toggles the `dark` class on `document.documentElement`.
- A `ThemeToggle` component (sun/moon icon swap, built on Radix Switch)
  is added to the component library now; it gets placed in the top nav
  in Phase 2 — no visible UI changes ship in this phase.

### New semantic tokens (light default, `.dark` override)

Defined as CSS custom properties in `@theme`, overridden inside a `.dark`
selector so the same property names resolve differently per theme:

| Token | Light | Dark |
|---|---|---|
| `--color-surface` | derived from `ft-off-white` | deep navy (derived from `ft-navy`, darker step) |
| `--color-surface-elevated` | white | navy, one step lighter than `--color-surface` |
| `--color-surface-sunken` | `ft-off-white`, darker step | navy, darker step |
| `--color-border` | `ft-navy` at low opacity | white at low opacity |
| `--color-text-primary` | `ft-navy` | white |
| `--color-text-secondary` | `ft-navy` at ~60% | white at ~70% |
| `--color-text-muted` | `ft-navy` at ~40% | white at ~50% |

Dark mode is built on `ft-navy`, not a generic near-black, so it still
reads as *this* brand rather than a generic dark theme swap.

### Status tokens (fixed, reserved)

`--color-status-good`, `--color-status-warning`, `--color-status-serious`,
`--color-status-critical` — used for state (unusual-transaction flag,
gain/loss, form validation, toast severity). Never reused as chart series
colors, and always paired with an icon + label, never color alone.

### Chart color tokens

Adopts the dataviz skill's validated reference palette rather than
inventing one, since the brand's two hues (navy, gold) can't safely
encode up to 8 categorical series on their own:

- **Categorical** (8 hues, fixed order — blue, orange, aqua, yellow,
  magenta, green, violet, red): used for multi-series data (expense
  categories, investment holdings allocation).
- **Sequential** (single blue ramp, steps 100-700): magnitude encoding
  where needed.
- **Diverging** (blue ↔ red, gray midpoint): income vs. expense, assets
  vs. liabilities, net positive/negative.
- **Status palette**: reused from the semantic status tokens above for
  chart annotations (e.g. a critical/overspend marker).

These ship as CSS custom properties (`--chart-series-1` … `--chart-series-8`,
`--chart-sequential-*`, `--chart-diverging-*`) documented in the style
guide. The reference palette's categorical/sequential/diverging hexes are
validated against a neutral dark surface (`#1a1a19`); since this app's
dark surface is navy-based instead, Phase 3 re-runs
`validate_palette.js` against the actual `--color-surface` dark value
before any chart ships, and re-steps lightness only if needed (hues and
order stay fixed).

## Component library (`src/components/ui/`)

One file per component, each independently responsive (own breakpoint
behavior, not just inherited from a parent container):

- **Inputs**: `Button`, `IconButton`, `Input` (text/currency/percent
  variants, floating label, error + helper text, icon slot), `Select`
  (Radix), `Textarea`, `Checkbox`, `Switch` (Radix), `Slider` (Radix).
- **Layout/display**: `Card`, `Badge`, `Avatar` (Radix), `StatCard`
  (KPI tile), `Table` (desktop full table w/ sticky header → tablet
  reduced columns → mobile card list, each breakpoint's behavior owned
  by the component itself), `Breadcrumbs`, `EmptyState`.
- **Navigation/overlay**: `Tabs` (Radix), `Accordion` (Radix), `Modal`
  (Radix Dialog), `DropdownMenu` (Radix), `Tooltip` (Radix), `Toast` +
  `ToastProvider` (Radix Toast).
- **Feedback**: `Skeleton` (text/card/table-row/chart shape variants,
  CSS shimmer animation), `Spinner` (compact, for buttons/inline
  actions), `ProgressBar` (Radix).
- **Theme**: `ThemeToggle`.

24 components total. Every component reads only from the token layer
above (no hardcoded hex values), so a future palette or spacing change
propagates without touching component internals.

## Verification

No test framework exists in this repo (`npm run lint` / `npm run build`
are the only checks). Verification for this phase:

1. A temporary dev-only route, `/style-guide`, rendering every component
   in every relevant state (default/hover/focus/disabled/loading/error,
   both themes) — added to `App.tsx`'s routes, not linked from any nav.
   Removed or gated out in a later phase once pages exercise the
   components directly.
2. `npm run build` passes (TypeScript project build + Vite production
   build).
3. Manual pass in a browser: keyboard-only navigation through the style
   guide (tab order, focus rings, Escape closes modal/dropdown), theme
   toggle persists across reload, resize through desktop → tablet →
   mobile breakpoints for Table/Card/Input to confirm each responds
   independently rather than only its parent container.

## Out of scope follow-ups (tracked for later phases)

- Placing `ThemeToggle` in the top nav (Phase 2).
- Migrating `TextField` usages and inline Tailwind markup on existing
  pages to the new component library (Phase 3).
- Re-validating chart dark-mode contrast against the real navy dark
  surface before first chart ships (Phase 3).
- Removing/gating the `/style-guide` route once no longer needed.
