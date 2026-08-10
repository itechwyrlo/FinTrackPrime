# Container-Query Responsive Tables

## Problem

`Table.tsx` is the single shared table component used by every page in the app
(Financial Statement, Investment Tracker, Style Guide — no page renders its own
raw `<table>`). It already collapses into stacked label/value cards on small
screens, but the switch is a **viewport** media query (`md:` = 768px browser
width).

On the Financial Statement page, Assets / Liabilities / Owner's Equity sit
side by side in a 3-column grid. At a normal desktop browser width (e.g.
1544px) the viewport is well above 768px, so the real `<table>` renders — but
each grid column only has ~450px of actual space, less than the table needs.
The result is truncated values and an internal horizontal scrollbar inside a
narrow column, even though the window itself is desktop-sized.

The component needs to react to the space it actually has, not the window.

## Approach

Tailwind v4 (already in this project, no new dependency) supports container
queries natively. Change `Table.tsx`:

1. Wrap the component's output in a `@container` div (sets
   `container-type: inline-size` on that box).
2. Replace the desktop-table / mobile-card toggle's `md:block` / `md:hidden`
   viewport prefixes with `@lg:block` / `@lg:hidden` container prefixes, so
   the switch is driven by the width available to the table itself.
3. Replace `priorityClass`'s `md:table-cell` / `lg:table-cell` viewport
   prefixes with matching `@` container prefixes, so column-priority hiding
   stays consistent with the new table/card switch (columns don't reappear
   independently of whether the table itself has room).

No other component or page changes — this is the only place a `<table>` is
rendered in the codebase.

## Breakpoint

`@lg` (32rem / 512px container width) is the table/card switch point —
comfortably above the ~450px columns seen in the Financial Statement grid, so
those stay in card mode, while single-column pages (Investment Tracker, Style
Guide) still get the real table once their container clears 512px, matching
the previous `md` (768px) viewport behavior in a single-column layout (where
the container is close to the viewport width already).

Column priority thresholds shift proportionally: `low` priority (desktop-only
columns) reveals at `@2xl` (42rem / 672px), scaled down from the old
`lg` (1024px) viewport threshold in the same ratio as the table/card switch
moved from `md` (768px) to `@lg` (512px). `medium` priority keeps the same
relationship it had before (visible whenever the table itself is visible).

## Testing

Manual verification only (no existing test coverage for this component):
- Financial Statement page at a normal desktop width: Assets/Liabilities
  tables now render as stacked cards inside their grid columns instead of
  scrolling/truncating.
- Investment Tracker / Style Guide tables: unchanged at typical widths
  (single-column layout gives the table enough room), still stack when the
  browser is narrowed to phone width.
- Loading skeleton and empty state are unaffected (no responsive markup
  change in those branches).
