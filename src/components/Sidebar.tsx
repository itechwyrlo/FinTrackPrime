import * as RadixDialog from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, Lock, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GuillocheMotif } from './GuillocheMotif'
import { NAV_CONFIG, UPGRADE_ITEM, type NavItem } from '../config/navConfig'
import { IconButton } from './ui/IconButton'
import { cn } from '../utils/cn'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

function NavLeafLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: Extract<NavItem, { type: 'link' }>
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-0',
          isActive ? 'border-ft-gold bg-white/5 text-ft-gold' : 'border-transparent text-white/80 hover:bg-white/5',
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {!collapsed && <span className="flex-1 overflow-hidden whitespace-nowrap">{item.label}</span>}
    </NavLink>
  )
}

// Premium is a single all-tools purchase: while locked, the whole group
// collapses into one "Premium tools" link straight to the paywall
// instead of listing the four tools individually — clicking any of
// them, locked, means exactly the same thing right now. Once unlocked
// it expands into the real per-tool links.
function LockedPremiumGroupLink({
  label,
  collapsed,
  onNavigate,
}: {
  label: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to="/upgrade"
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-0',
          isActive ? 'border-ft-gold bg-white/5 text-ft-gold' : 'border-transparent text-white/60 hover:bg-white/5',
        )
      }
    >
      <Lock className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {!collapsed && <span className="flex-1 overflow-hidden whitespace-nowrap">{label}</span>}
    </NavLink>
  )
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user } = useAuth()
  const premiumUnlocked = user?.premiumUnlocked ?? false

  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_CONFIG.map((item) => {
        if (item.type === 'link') {
          return <NavLeafLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        }

        if (item.premiumGated && !premiumUnlocked) {
          return <LockedPremiumGroupLink key={item.label} label={item.label} collapsed={collapsed} onNavigate={onNavigate} />
        }

        return (
          <div key={item.label} className="mt-4">
            {!collapsed && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-white/40">{item.label}</p>
            )}
            <div className={cn('flex flex-col gap-1', collapsed && 'border-t border-white/10 pt-3')}>
              {item.items.map((sub) => sub.type === 'link' && <NavLeafLink key={sub.to} item={sub} collapsed={collapsed} onNavigate={onNavigate} />)}
            </div>
          </div>
        )
      })}

      {!premiumUnlocked && (
        <NavLink
          to={UPGRADE_ITEM.to}
          onClick={onNavigate}
          title={collapsed ? UPGRADE_ITEM.label : undefined}
          className={({ isActive }) =>
            cn(
              'mt-3 flex items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
              collapsed && 'justify-center px-0',
              isActive ? 'border-ft-gold/50 bg-ft-gold/10 text-ft-gold' : 'border-ft-gold/30 text-ft-gold/80 hover:bg-ft-gold/10',
            )
          }
        >
          <UPGRADE_ITEM.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {!collapsed && <span className="overflow-hidden whitespace-nowrap">Unlock Premium</span>}
        </NavLink>
      )}
    </nav>
  )
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth()

  if (collapsed) {
    return (
      <div className="mt-auto flex justify-center border-t border-white/10 pt-4">
        <IconButton
          icon={<LogOut className="h-4 w-4" />}
          label="Log out"
          variant="ghost"
          onClick={logout}
          className="text-white/70 hover:bg-white/5 hover:text-ft-gold"
        />
      </div>
    )
  }

  return (
    <div className="mt-auto border-t border-white/10 pt-4 text-sm">
      <p className="truncate font-medium text-white">{user?.fullName}</p>
      <p className="truncate text-white/60">{user?.email}</p>
      <button
        type="button"
        onClick={logout}
        className="mt-3 text-white/70 underline decoration-white/30 underline-offset-2 hover:text-ft-gold"
      >
        Log out
      </button>
    </div>
  )
}

/**
 * Desktop/tablet: fixed rail that widens/narrows in place (never overlays
 * content). Mobile: a drawer over the content, built on Radix Dialog for
 * focus-trapping/Escape/scrim behavior, closed by default and not persisted.
 */
export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onMobileOpenChange }: SidebarProps) {
  // Close the mobile drawer automatically on navigation.
  const closeOnMobile = () => onMobileOpenChange(false)

  return (
    <>
      <aside
        className={cn(
          'relative hidden shrink-0 overflow-hidden bg-ft-navy text-white transition-[width] duration-300 ease-out md:flex md:flex-col',
          collapsed ? 'md:w-[72px]' : 'md:w-64',
        )}
      >
        <GuillocheMotif className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 opacity-60" />
        <div className="relative flex h-full flex-col p-4">
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
            {!collapsed && (
              <a href="/dashboard" className="font-display text-xl">
                FinTrack&nbsp;<span className="text-ft-gold">Prime</span>
              </a>
            )}
            <IconButton
              icon={collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              variant="ghost"
              onClick={onToggleCollapsed}
              className="text-white/70 hover:bg-white/5 hover:text-ft-gold"
            />
          </div>

          <div className="mt-8 flex-1 overflow-y-auto">
            <SidebarNav collapsed={collapsed} />
          </div>

          <SidebarFooter collapsed={collapsed} />
        </div>
      </aside>

      <RadixDialog.Root open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-40 bg-ft-navy/60 backdrop-blur-sm md:hidden data-[state=open]:animate-[ft-fade-in_150ms_ease-out] data-[state=closed]:animate-[ft-fade-out_150ms_ease-in]" />
          <RadixDialog.Content className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-ft-navy text-white shadow-xl outline-none md:hidden data-[state=open]:animate-[ft-slide-in-left_200ms_ease-out] data-[state=closed]:animate-[ft-slide-out-left_200ms_ease-in]">
            <RadixDialog.Title className="sr-only">Main navigation</RadixDialog.Title>
            <GuillocheMotif className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 opacity-60" />
            <div className="relative flex h-full flex-col overflow-y-auto p-4">
              <a href="/dashboard" className="font-display text-xl">
                FinTrack&nbsp;<span className="text-ft-gold">Prime</span>
              </a>
              <div className="mt-8 flex-1">
                <SidebarNav collapsed={false} onNavigate={closeOnMobile} />
              </div>
              <SidebarFooter collapsed={false} />
            </div>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    </>
  )
}
