import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Download, LogOut, Menu, Plus, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { findBreadcrumbTrail } from '../config/navConfig'
import type { AccountViewModel } from '../types/api'
import { Breadcrumbs } from './ui/Breadcrumbs'
import { IconButton } from './ui/IconButton'
import { Button } from './ui/Button'
import { DropdownMenu } from './ui/DropdownMenu'
import { Avatar } from './ui/Avatar'
import { ThemeToggle } from './ui/ThemeToggle'
import { EmptyState } from './ui/EmptyState'
import { SearchPalette } from './SearchPalette'
import { CreateAccountModal } from './CreateAccountModal'
import { AddTransactionModal } from './AddTransactionModal'

interface TopNavProps {
  onOpenMobileSidebar: () => void
  accounts: AccountViewModel[]
}

export function TopNav({ onOpenMobileSidebar, accounts }: TopNavProps) {
  const { user, logout } = useAuth()
  const { isInstallable, promptInstall } = useInstallPrompt()
  const location = useLocation()
  const trail = findBreadcrumbTrail(location.pathname)
  const pageTitle = trail[trail.length - 1]?.label ?? 'FinTrack Prime'

  const [searchOpen, setSearchOpen] = useState(false)
  const [createAccountOpen, setCreateAccountOpen] = useState(false)
  const [addTransactionOpen, setAddTransactionOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface-elevated/95 px-4 py-3 backdrop-blur sm:px-6">
      <IconButton icon={<Menu className="h-5 w-5" />} label="Open navigation" variant="ghost" onClick={onOpenMobileSidebar} className="md:hidden" />

      <div className="min-w-0 flex-1">
        {/* A single-item trail just repeats the <h1> below it, so it only
            renders once there's an actual ancestor (e.g. a Premium tool
            under "Premium tools") worth showing. */}
        {trail.length > 1 && <Breadcrumbs items={trail} />}
        <h1 className="mt-0.5 truncate font-display text-lg text-text-primary">{pageTitle}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-ft-blue/40 sm:flex"
        >
          <Search className="h-4 w-4" />
          Search
          <kbd className="ml-4 rounded border border-border-strong px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
        </button>
        <IconButton icon={<Search className="h-4 w-4" />} label="Search" variant="ghost" onClick={() => setSearchOpen(true)} className="sm:hidden" />

        <DropdownMenu
          trigger={<IconButton icon={<Plus className="h-4 w-4" />} label="Quick actions" variant="secondary" />}
          items={[
            { label: 'Add transaction', onSelect: () => setAddTransactionOpen(true) },
            { label: 'Create account', onSelect: () => setCreateAccountOpen(true) },
          ]}
        />

        <DropdownMenu
          trigger={<IconButton icon={<Bell className="h-4 w-4" />} label="Notifications" variant="ghost" />}
          items={[]}
          header={<EmptyState title="No notifications yet" />}
        />

        {isInstallable && (
          <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />} onClick={promptInstall} className="hidden sm:inline-flex">
            Install app
          </Button>
        )}

        <ThemeToggle />

        <DropdownMenu
          trigger={
            <button type="button" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ft-blue/40">
              <Avatar name={user?.fullName ?? '?'} size="sm" />
            </button>
          }
          header={
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{user?.fullName}</p>
              <p className="truncate text-xs text-text-secondary">{user?.email}</p>
            </div>
          }
          items={[{ label: 'Log out', icon: <LogOut className="h-4 w-4" />, onSelect: logout }]}
        />
      </div>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} accounts={accounts} />
      <CreateAccountModal open={createAccountOpen} onOpenChange={setCreateAccountOpen} />
      <AddTransactionModal open={addTransactionOpen} onOpenChange={setAddTransactionOpen} />
    </header>
  )
}
