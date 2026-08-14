import {
  ArrowLeftRight,
  Calculator,
  Crown,
  FileText,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface NavLeaf {
  type: 'link'
  to: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  type: 'group'
  label: string
  items: NavItem[]
  // Premium is a single all-tools purchase, so the whole group is
  // gated together, not any one item inside it. While locked, the
  // Sidebar collapses this group into one link to /upgrade instead of
  // rendering its items.
  premiumGated?: boolean
}

export type NavItem = NavLeaf | NavGroup

// Single source of truth for the sidebar, breadcrumbs, and the top nav's
// page title. Adding a page is one entry here — nested groups (like
// Premium tools below) are a first-class part of the schema, not a
// one-off special case.
export const NAV_CONFIG: NavItem[] = [
  { type: 'link', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'link', to: '/budget-planner', label: 'Budget Planner', icon: Wallet },
  { type: 'link', to: '/cash-flow', label: 'Cash Flow', icon: ArrowLeftRight },
  {
    type: 'group',
    label: 'Premium tools',
    premiumGated: true,
    items: [
      { type: 'link', to: '/loan-calculator', label: 'Loan Calculator', icon: Calculator },
      { type: 'link', to: '/investment-tracker', label: 'Investment Tracker', icon: LineChart },
      { type: 'link', to: '/retirement-planner', label: 'Retirement Planner', icon: PiggyBank },
      { type: 'link', to: '/financial-statement', label: 'Financial Statement', icon: FileText },
    ],
  },
]

// Rendered separately from NAV_CONFIG (distinct styling, always visible
// regardless of unlock state) but still part of the same route→label map.
export const UPGRADE_ITEM: NavLeaf = { type: 'link', to: '/upgrade', label: 'Upgrade', icon: Crown }

function flattenLeaves(items: NavItem[]): NavLeaf[] {
  return items.flatMap((item) => (item.type === 'link' ? [item] : flattenLeaves(item.items)))
}

export const ALL_NAV_LEAVES: NavLeaf[] = [...flattenLeaves(NAV_CONFIG), UPGRADE_ITEM]

export function findNavLeafByPath(path: string): NavLeaf | undefined {
  return ALL_NAV_LEAVES.find((leaf) => leaf.to === path)
}

export interface BreadcrumbTrailItem {
  label: string
  to?: string
}

function searchTrail(items: NavItem[], path: string, trail: BreadcrumbTrailItem[]): BreadcrumbTrailItem[] | null {
  for (const item of items) {
    if (item.type === 'link') {
      if (item.to === path) return [...trail, { label: item.label, to: item.to }]
    } else {
      const found = searchTrail(item.items, path, [...trail, { label: item.label }])
      if (found) return found
    }
  }
  return null
}

/** Breadcrumb trail (ancestor group labels, no link, then the current page) for a given route path. */
export function findBreadcrumbTrail(path: string): BreadcrumbTrailItem[] {
  if (path === UPGRADE_ITEM.to) return [{ label: UPGRADE_ITEM.label, to: UPGRADE_ITEM.to }]
  return searchTrail(NAV_CONFIG, path, []) ?? [{ label: 'FinTrack Prime' }]
}
