# Container-Query Responsive Tables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shared `Table` component stack into cards based on the width of its own container, not just the browser viewport, so it no longer overflows/truncates inside narrow layout columns (e.g. the 3-column Financial Statement grid) at desktop window widths.

**Architecture:** Single-file change to `src/components/ui/Table.tsx`. Replace the component's viewport-based Tailwind breakpoint prefixes (`md:`, `lg:`) with Tailwind v4's built-in container-query prefixes (`@lg:`, `@2xl:`), scoped by wrapping the component's markup in a `@container` box.

**Tech Stack:** React 19, Tailwind CSS v4 (`@tailwindcss/vite`, container queries built in — no new dependency), TypeScript, Vite.

## Global Constraints

- Table/card switch point: `@lg` (32rem / 512px container width) — per spec.
- `low`-priority columns reveal at `@2xl` (42rem / 672px) — per spec.
- `medium`-priority columns keep the same relationship they had before (visible whenever the table itself is visible) — per spec.
- No other file in the codebase renders a raw `<table>`; this is the only component to touch — confirmed via repo-wide grep during design.
- No test framework exists in this repo (no vitest/jest, no `*.test.*` files) — verification is manual (dev server + resizing), consistent with the spec's Testing section. Do not invent a test framework as part of this task.

---

### Task 1: Switch Table.tsx from viewport to container queries

**Files:**
- Modify: `src/components/ui/Table.tsx:25-29` (the `priorityClass` function)
- Modify: `src/components/ui/Table.tsx:51-110` (the component's returned markup)

**Interfaces:**
- Consumes: nothing new — `TableColumn<T>`, `TableProps<T>`, and the `Table` component's public signature (`columns`, `data`, `keyExtractor`, `isLoading`, `emptyMessage`) are unchanged. Callers (`FinancialStatementPage.tsx`, `InvestmentTrackerPage.tsx`, `StyleGuidePage.tsx`) need no changes.
- Produces: same `Table<T>` export, same rendered DOM structure (table + `<ul>` card fallback), just with container-query classes instead of viewport ones. No new files or exports.

- [ ] **Step 1: Update `priorityClass` to use container-query prefixes**

In `src/components/ui/Table.tsx`, replace:

```tsx
function priorityClass(priority: TableColumn<unknown>['priority']) {
  if (priority === 'low') return 'hidden lg:table-cell'
  if (priority === 'medium') return 'hidden md:table-cell'
  return 'table-cell'
}
```

with:

```tsx
function priorityClass(priority: TableColumn<unknown>['priority']) {
  if (priority === 'low') return 'hidden @2xl:table-cell'
  if (priority === 'medium') return 'hidden @lg:table-cell'
  return 'table-cell'
}
```

Also update the doc comment on `TableColumn.priority` (currently `/** high = always visible. medium = hidden below the tablet breakpoint. low = desktop-only. */`) to say the thresholds are now container-relative:

```tsx
  /** high = always visible. medium = hidden below the table's @lg container width. low = hidden below @2xl. */
  priority?: 'high' | 'medium' | 'low'
```

- [ ] **Step 2: Wrap the component's markup in a `@container` box and swap the table/card toggle to `@lg`**

Replace the component's return statement (the `<>...</>` fragment containing the desktop table div and the mobile `<ul>`):

```tsx
  return (
    <>
      {/* Desktop / tablet: real table, sticky header, columns hidden by priority. */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface-elevated md:block">
        <table className="w-full border-collapse text-sm">
```

with:

```tsx
  return (
    <div className="@container">
      {/* Real table, sticky header, columns hidden by priority — shown once
          this component's own container (not the viewport) has room. */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface-elevated @lg:block">
        <table className="w-full border-collapse text-sm">
```

and further down, replace:

```tsx
      {/* Mobile: each row becomes a card of label/value pairs. */}
      <ul className="space-y-3 md:hidden">
```

with:

```tsx
      {/* Narrow container: each row becomes a card of label/value pairs. */}
      <ul className="space-y-3 @lg:hidden">
```

and change the closing tag of the fragment from `</>` to `</div>` at the end of the return statement.

Also update the component's doc comment above `export function Table<T>`:

```tsx
/**
 * Responsive data table: full table with sticky header when its container
 * is wide enough, columns drop by priority as space tightens, and rows
 * become stacked label/value cards when the container is narrow — driven by
 * the table's own available width (via container queries), not the
 * viewport, so this behaves correctly both on phones and inside narrow
 * desktop layout columns (e.g. Financial Statement's 3-column grid).
 */
```

- [ ] **Step 3: Type-check and lint**

Run:
```bash
npm run build
npm run lint
```
Expected: both exit 0. `npm run build` runs `tsc -b` first, so it will catch any JSX mismatch from the fragment→div change (e.g. an unclosed tag).

- [ ] **Step 4: Manual visual verification**

Run:
```bash
npm run dev
```

In a browser:
1. Open the Financial Statement page. Confirm the Assets and Liabilities tables now render as stacked label/value cards (no more cut-off amounts or an internal horizontal scrollbar), even at a full desktop window width — since each grid column is narrower than the `@lg` (512px) threshold.
2. Open the Investment Tracker page (single-column layout, more width available). Confirm its table still renders as a real `<table>` at normal desktop width, and switches to stacked cards only once the browser window is narrowed down (drag it below ~512px content width, or use devtools responsive mode at a phone size).
3. Open the Style Guide page's table example and check it also still switches correctly at both ends.
4. Toggle dark mode on one of these pages and confirm no visual regression (borders/surface colors unaffected — this change only touches display/visibility classes).

Expected: no console errors; both the "shrinks with the window" and "shrinks with its own narrow container" cases produce stacked cards; wide single-column tables still show the real table at normal desktop widths.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Table.tsx
git commit -m "fix: switch Table to container queries so it stacks in narrow layout columns, not just narrow viewports"
```
