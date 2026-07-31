# FinTrack Prime — Frontend (Phase 1 + Phase 2 + Phase 3 + Phase 4)

React + TypeScript, built with Vite. Deploys to Vercel.

## Stack

- **React Router** for navigation
- **TanStack Query** for server data (dashboard, later budget/cash-flow/etc.)
- **React Context** for session state (JWT, current user, premium flag) —
  small and global, doesn't need Query's caching behavior
- **Axios** with an interceptor that attaches the JWT to every request
  and reacts to 401 (session expired → logs out) and 403 (premium
  required)
- **Tailwind CSS v4**, theme tokens in `src/index.css` matching the
  original site's brand: navy (`ft-navy`), gold (`ft-gold` /
  `ft-gold-dark` / `ft-gold-ink`), Libre Caslon Text for display,
  Public Sans for body text

## Design carried over from the original site

- The guilloché rosette (banknote-engraving motif) is now a reusable
  `<GuillocheMotif />` component instead of an inline SVG symbol, used
  as a watermark on the sidebar and the auth screens.
- Tabular numerals (`.tabular-figure`) on every dollar amount, so
  figures don't shift width as digits change.
- Same navy/gold palette and type pairing throughout.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and point `VITE_API_BASE_URL` at
   your running backend (`https://localhost:xxxx` in dev, your
   MonsterASP.NET URL once deployed).
3. `npm run dev`

## What's built

- **Login** (`/login`) and **Register** (`/register`), split-panel
  layout, the guilloché motif on the dark side.
- **Account dashboard** (`/dashboard`): every account the user owns,
  balance, and recent transactions. Transactions flagged unusual by
  the backend get a visible "Unusual" badge and a highlighted row.
- Route protection: `/dashboard` (and everything added after it)
  redirects to `/login` if there's no session. An expired/invalid
  token anywhere in the app triggers an automatic logout via the
  Axios interceptor + a window event, not a per-screen check.

## Phase 2 additions

- **Budget Planner** (`/budget-planner`): every category is editable
  inline, name and amount both. Totals and the expense-breakdown chart
  recompute from local state on every keystroke, not after a save. The
  actual network write is debounced 500ms after you stop typing
  (`useDebouncedCallback`), so the screen never waits on the network to
  feel responsive, and the backend isn't hit on every character either.
- **Cash Flow Dashboard** (`/cash-flow`): total income/expenses/net,
  an expense-by-category bar chart, and a monthly income-vs-expenses
  trend line, all from `GET /api/cash-flow`.
- **Recharts** added for both screens' charts.

This is the direct answer to Prof's "not interactive" comment: numbers
and charts now update as you type, before any server round trip
completes.

## Verified

`npm run build` completes cleanly through Phase 2 as well (TypeScript
project build + Vite production build). Recharts pushes the bundle
over Vite's 500kB chunk-size warning threshold, that's expected and not
an error, code-splitting it is a reasonable later optimization but not
needed for this scope. Same caveat as Phase 1: no live backend was
available in this sandbox to click-test the actual save/chart-update
behavior end to end.

## Phase 3 additions: the paywall

- **Upgrade screen** (`/upgrade`): pitches the four premium tools,
  renders PayPal's Buttons SDK, and on approval:
  1. Calls `actions.order.capture()` client-side (required before the
     order's status is `COMPLETED`; approval alone isn't enough).
  2. Sends the order id to `POST /api/checkout/verify`.
  3. On success, calls the same `login()` from AuthContext that
     register/login use, since verify returns a fresh JWT with
     `hasPremiumAccess: true` baked in. The old token is discarded
     immediately, not left to expire on its own.
- **Sidebar link** now shows "Unlock Premium" or "Premium ✓" depending
  on the session's current status.
- **`PremiumRoute`** component added (mirrors `ProtectedRoute`), ready
  for Phase 4's four tool routes. This is a frontend convenience only;
  the backend's `RequirePremium` policy is still the real gate.

### PayPal setup needed

Add `VITE_PAYPAL_CLIENT_ID` to `.env.local`, your PayPal Sandbox app's
client id (the public one, not the secret, this runs in the browser).
The price shown and sent to PayPal (`$49.00 USD`) is hardcoded in
`UpgradePage.tsx` and has to match `Premium:PriceUsd` /
`Premium:Currency` in the backend's `appsettings.json` — if you change
the price on one side, change it on the other too.

## Phase 4 additions: the four premium tools

All four sit behind `PremiumRoute`, redirecting to `/upgrade` if the
session isn't premium. The sidebar shows all four with a 🔒 next to
each until unlocked, so a non-premium user sees what they're missing
rather than the nav item just disappearing.

- **Loan Calculator** (`/loan-calculator`): input pane on the left,
  results and a remaining-balance-over-time chart on the right.
  Since the math lives entirely on the backend (not duplicated in the
  frontend), every input change debounces a call to
  `POST /api/loan-calculator/calculate` and redraws the chart from
  whatever comes back.
- **Investment Portfolio Tracker** (`/investment-tracker`): an
  editable holdings table (shares, cost basis, current price all
  inline), an allocation pie chart, and running totals, same
  debounced-save pattern as the Budget Planner.
- **Retirement Planner** (`/retirement-planner`): sliders instead of
  number boxes for age, contribution, and return rate, an area chart
  of projected balance by age. Debounced 400ms after a slider stops
  moving, calling `PUT /api/retirement-planner`.
- **Financial Statement** (`/financial-statement`): assets (read-only,
  pulled from accounts and investment holdings), liabilities (add and
  remove, no inline amount editing since the backend only supports
  add/delete there), net worth, and an assets-vs-liabilities bar
  chart.

## What's now complete

All four phases are built: authentication and account dashboard, the
two free tools, the PayPal-verified paywall, and all four premium
tools. Every backend endpoint from the complete backend package now
has a corresponding screen.

## Verified

`npm run build` completes cleanly through all four phases. Same
caveat throughout this project: no live backend was available in this
sandbox, so nothing here has been click-tested against real API
responses. Test the full flow, register → dashboard → edit a budget
category → upgrade → use a premium tool, end to end once both sides
are deployed.
