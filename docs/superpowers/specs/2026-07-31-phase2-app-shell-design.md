# Phase 2: App Shell (Sidebar + Top Nav)

Status: Approved for implementation
Date: 2026-07-31

## Context

Builds on [Phase 1](./2026-07-31-phase1-design-system-design.md)'s token
layer and component library. Today's `AppLayout` is a fixed, non-collapsible,
desktop-only 256px sidebar with a flat nav array and no top nav, breadcrumbs,
search, or notifications. This phase replaces `AppLayout`'s shell with a
premium, responsive, configurable sidebar + top nav, per the redesign's
sidebar/navigation requirements.

**Out of scope**: no page content changes. `DashboardPage`,
`BudgetPlannerPage`, etc. are untouched (Phase 3). No PWA work (Phase 4).

## Sidebar

### Config schema (`src/config/navConfig.ts`)

Recursive so nested groups are a first-class capability, not a one-off:

```ts
interface NavLeaf {
  type: 'link'
  to: string
  label: string
  icon: LucideIcon
  premiumTool?: PremiumTool // presence marks it a premium item (lock/check badge)
}
interface NavGroup {
  type: 'group'
  label: string
  items: NavItem[]
}
type NavItem = NavLeaf | NavGroup
```

Today's config is two groups: the flat main items (Dashboard, Budget
Planner, Cash Flow) and one nested group (Premium tools: Loan Calculator,
Investment Tracker, Retirement Planner, Financial Statement), plus the
Upgrade link. Adding a page is one entry in this array — no JSX hunting.

This same config drives breadcrumbs and the top nav's page title (single
source of truth for route → label/icon, replacing the ad hoc strings
scattered across the current sidebar).

### Responsive behavior

- **`<768px` (mobile)**: drawer. Hidden by default, opened via a hamburger
  button in the top nav, built on Radix Dialog (`Sidebar Drawer` variant —
  same accessible base as `Modal`, styled as a full-height panel sliding in
  from the left with a scrim). Not persisted; always closed on load.
- **`≥768px`**: fixed `<aside>`, never overlays content. One boolean
  `collapsed` state, persisted to `localStorage['ft-sidebar-collapsed']`.
  Default on first visit: expanded at `≥1024px`, collapsed at `768–1023px`.
  After the user's first manual toggle, their choice sticks regardless of
  exact width. **Scope simplification**: this is one collapse mechanism
  with a width-aware default, not a separate tablet-specific layout mode —
  called out explicitly since "tablet adaptive mode" could be read as
  requiring more.
- Width transition: `72px` (icon rail) ↔ `256px` (full), animated via
  `transition-[width] duration-300 ease-out`. Labels use
  `overflow-hidden whitespace-nowrap` with width/opacity transitioning
  together so text doesn't reflow-pop at the end of the animation.

### Item rendering

- Active item: gold left border (`border-l-2 border-ft-gold`) + gold text,
  replacing the current `bg-white/10` block highlight, smooth color
  transition on route change.
- Icon always visible (rail or full). Label only rendered when expanded.
- The Premium tools group renders as an inline section (small uppercase
  label + its items) when expanded. When collapsed, its items still show
  as icons under a divider — no flyout/popover submenu, since there's
  only one nested group today and a flyout would be unused complexity.
- Lock (🔒 today, becomes a `lucide-react` `Lock` icon) / check indicator
  for premium items carries over, now a `Badge`.
- `GuillocheMotif` watermark stays, repositioned to work at both rail and
  full widths.

## Top nav (`src/components/TopNav.tsx`)

Left: hamburger (mobile only) / collapse toggle (`≥768px`), then
`Breadcrumbs` + page title, both derived from `navConfig` by matching the
current route — no duplicated label strings.

Right, in order: search trigger, quick-actions `+` menu, notifications
bell, `ThemeToggle` (built in Phase 1, placed here now — its first visible
usage), user-profile `DropdownMenu`. On narrow widths, right-side items
collapse into an overflow `DropdownMenu` (search stays a persistent icon
button since it's the highest-frequency action) rather than wrapping or
causing horizontal scroll.

### Search — real quick-jump, not a placeholder

`SearchPalette` component: a `Modal`-style command palette opened by
clicking the search trigger or `Ctrl+K` / `⌘K`. Two result groups:

1. **Pages** — static, from `navConfig`, filtered by label substring match.
2. **Accounts** — from the TanStack Query `['dashboard']` cache. `AppLayout`
   runs `useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get })`
   itself so results are available even if the user hasn't visited
   `/dashboard` yet; React Query dedupes this against `DashboardPage`'s own
   identical query key, so no duplicate network request once both are
   mounted.

Selecting a page result navigates to it. Selecting an account result
navigates to `/dashboard` (no per-account detail route exists in this
app — documented limitation, not a bug to fix here).

### Notifications — static placeholder

Bell `IconButton` opens a small popover (`DropdownMenu`-style container)
with an `EmptyState`: "No notifications yet." No backend call. Ready to
wire to a real feed in a future phase.

### Quick actions — global "+" menu

`DropdownMenu` with two items, each opening a new shared modal:

- **`CreateAccountModal`** (`src/components/CreateAccountModal.tsx`) —
  same fields/mutation as `DashboardPage`'s current `CreateAccountForm`
  (`accountsApi.create`), rebuilt with Phase 1's `Modal` + `Input` +
  `Select`.
- **`AddTransactionModal`** (`src/components/AddTransactionModal.tsx`) —
  same fields/mutation as the current `AddTransactionForm`
  (`accountsApi.addTransaction`), plus an account-picker `Select`
  (populated from the same cached dashboard data as search) since there's
  no implicit "current account" context from the top nav the way there is
  on a per-account card.

Both invalidate the `['dashboard']` query on success, same as today.

**Explicitly not done in this phase**: `DashboardPage`'s existing inline
`CreateAccountForm`/`AddTransactionForm` are left as-is — not touched, not
deleted. Migrating `DashboardPage` to use these two shared modals (and
deleting the now-duplicated inline versions) is a Phase 3 follow-up, since
Phase 3 is where page content gets rewired to the component library.

### User-profile menu

`DropdownMenu` triggered by an `Avatar`: shows name/email (non-interactive
header row) then "Log out" — same data and `logout()` call as today's
sidebar footer, just relocated to the top nav per the design's nav
requirements.

## `AppLayout.tsx` changes

Replaces the current inline sidebar JSX with: `<Sidebar />` (new component,
config-driven, responsive per above) + a `<div>` wrapping `<TopNav />` and
`<Outlet />`. Sidebar collapse/mobile-drawer state lives in `AppLayout`
(or a small local context if prop-drilling gets awkward) since both the
sidebar and the top nav's hamburger/collapse toggle need to read/write it.

## Out of scope follow-ups (tracked for later phases)

- Migrating `DashboardPage` to `CreateAccountModal`/`AddTransactionModal`
  and removing its inline duplicate forms (Phase 3).
- Real notifications backed by actual data (future phase, not scoped).
- Per-account detail route, which would let search results deep-link
  (future phase, not scoped).
