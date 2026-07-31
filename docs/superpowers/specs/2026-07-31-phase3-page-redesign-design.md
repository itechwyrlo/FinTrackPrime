# Phase 3: Page-by-Page Redesign

Status: Approved for implementation
Date: 2026-07-31

## Context

Builds on [Phase 1](./2026-07-31-phase1-design-system-design.md) (tokens +
component library) and [Phase 2](./2026-07-31-phase2-app-shell-design.md)
(sidebar + top nav). This phase rewires every remaining page to consume
the component library instead of hand-rolled Tailwind, and closes the
follow-ups both prior specs flagged. **No business logic, API calls,
routing, auth, or payment behavior changes** — this is presentation only.

## Shared additions (built once, used by multiple pages)

- **`Input` gets an optional `trailingAction` slot** — a right-aligned
  interactive element (distinct from the existing left `icon` slot).
  Needed for password visibility toggling; generically reusable for any
  future affix-on-the-right case.
- **`PasswordInput`** (`src/components/ui/PasswordInput.tsx`) — wraps
  `Input` with `type="password"/"text"` local state and an eye/eye-off
  `trailingAction`. Used by Login and Register.
- **Loading pattern**: every page's "Loading…" text replaced with
  `Skeleton`/`SkeletonCard`/`SkeletonChart`/`SkeletonTableRow` matching
  that page's actual layout (per the original loading-states requirement:
  skeletons should minimize layout shift, not just indicate "busy").
- **Error pattern**: full-page fetch failures (`isError` from `useQuery`)
  become an `EmptyState` with a "Try again" `Button` calling `refetch()`.
  Mutation failures (`onError`) move from inline red text to
  `toast({ variant: 'error' })`.
- **Chart restyle**: every Recharts `<Bar>`/`<Line>`/`<Area>`/`<Pie>` fill
  moves from Recharts' defaults to Phase 1's chart tokens — categorical
  slots for multi-series (expense categories, holdings), diverging
  blue/red for income-vs-expense and assets-vs-liabilities.

## Dashboard (`DashboardPage.tsx`)

- Migrates to Phase 2's `CreateAccountModal`/`AddTransactionModal`,
  **removing** the inline `CreateAccountForm`/`AddTransactionForm` and
  their "+ Create account" / "+ Add transaction" trigger buttons — this
  was the explicit follow-up flagged in the Phase 2 spec, now closed.
- Adds a `StatCard` summary row above the account grid: total balance
  across accounts, and a count of unusual-flagged transactions this
  period (both derived client-side from the existing `DashboardViewModel`
  response — no new endpoint).
- Each account becomes a `Card`; the transaction list inside stays a list
  (not a `Table` — it's already a compact list and doesn't need columns),
  restyled with the token layer and `Badge` for the "Unusual" flag.
- Loading: a grid of `SkeletonCard`. Error: `EmptyState` + retry.

## Login / Register (`LoginPage.tsx`, `RegisterPage.tsx`, `AuthLayout.tsx`)

- `AuthLayout`'s split panel (guilloché motif on the dark side) is kept as
  the layout shell, restyled with tokens.
- Forms rebuilt with `Input` (name/email) and the new `PasswordInput`.
  Inline validation errors move to `Input`'s `error` prop instead of a
  separate `<p>`. Submit button becomes `Button` with `isLoading` during
  the request instead of text-swapping ("Logging in…").

## Budget Planner (`BudgetPlannerPage.tsx`)

- Category rows: `Card`-based list, name as inline-editable `Input`,
  amount as inline-editable `Input variant="currency"` — same
  keystroke-recompute + 500ms-debounced-save behavior, untouched.
- Totals (planned income/expense/net) become a `StatCard` row.
- Expense-breakdown bar chart restyled with categorical tokens.
- Loading: `SkeletonCard` list + `SkeletonChart`.

## Cash Flow (`CashFlowPage.tsx`)

- Total income / total expenses / net become `StatCard`s (net gets a
  `trend` indicator, up/good if positive).
- Expense-by-category bar chart: categorical tokens. Monthly
  income-vs-expenses trend line: diverging blue (income) / red (expense)
  — two clearly-opposed series, matches the diverging token's intent.
- Loading: 3 `StatCard` skeletons + 2 `SkeletonChart`.

## Loan Calculator (`LoanCalculatorPage.tsx`)

- Input pane: `Input variant="currency"` (principal, extra payment),
  `Input variant="percent"` (rate), plain `Input` (term months) — same
  debounced `POST /api/loan-calculator/calculate` call, untouched.
- Results: `StatCard`s (monthly payment, payoff time, total interest,
  total paid).
- Remaining-balance line chart: sequential blue ramp (single series,
  magnitude over time).
- "Calculating…" state: `Spinner` inline near the results, not a
  full-page skeleton (localized, per the spinner-vs-skeleton distinction).

## Investment Tracker (`InvestmentTrackerPage.tsx`)

- Holdings move from a bespoke editable div-table to the Phase 1 `Table`
  component: `render` cells contain inline `Input` fields for
  shares/cost-basis/current-price (same debounced-save mutation), plain
  text for computed value/gain-loss. This gets the responsive
  table→cards behavior for free instead of the current fixed layout.
- Allocation pie chart: categorical tokens, legend required (≥2 series
  per the palette rules) — first 3 slots hold the all-pairs CVD guarantee
  from Phase 1's spec; a holding count above that folds into "Other" in
  the chart (table below still lists every holding individually).
- Running totals as `StatCard`s.

## Retirement Planner (`RetirementPlannerPage.tsx`)

- Raw `<input type="range">` sliders replaced with Phase 1's `Slider`
  component (age, retirement age, current savings, monthly contribution,
  return rate) — same 400ms-debounced `PUT /api/retirement-planner` call,
  untouched.
- Projected-balance area chart: sequential blue ramp.
- Projected balance at retirement: a prominent `StatCard`.

## Financial Statement (`FinancialStatementPage.tsx`)

- Assets (read-only) and liabilities become two `Table` instances (not
  cards — this is genuinely tabular, name + amount, and liabilities need
  a delete action per row, which the `Table`'s `render` cells handle
  cleanly).
- Add-liability stays an inline form (not a modal) — it's two fields
  (name, amount), matching the existing simplicity; rebuilt with `Input`s
  and a `Button`.
- Net worth: prominent `StatCard`. Assets-vs-liabilities bar chart:
  diverging blue (assets) / red (liabilities).

## Upgrade (`UpgradePage.tsx`)

- Each of the four tools becomes a `Card` with a `Badge`
  (locked/unlocked/purchased-date), restyled but structurally the same
  grid.
- **Untouched entirely**: the PayPal Buttons SDK integration, order
  capture, `POST /api/checkout/verify` call, and the `login()` re-auth on
  success — this is explicitly non-goal, payment logic is out of scope
  for a presentation-only phase.
- Loading/verifying states during PayPal capture: `Spinner`, not a
  skeleton (it's a short-lived localized action, not a large content
  area).

## Out of scope

- Any change to `src/api/*.ts`, `AuthContext`, routing, or the
  `PremiumRoute`/`ProtectedRoute` gates.
- PWA work (Phase 4).
- Re-running `validate_palette.js` against the actual navy dark surface
  (flagged in Phase 1 as a Phase 3 follow-up) — deferred further since no
  live backend/browser was available to render and screenshot the charts
  in this sandbox; the token values are used as documented in Phase 1
  pending that visual check.
