import * as RadixDialog from '@radix-ui/react-dialog'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Wallet } from 'lucide-react'
import { ALL_NAV_LEAVES } from '../config/navConfig'
import type { AccountViewModel } from '../types/api'

interface SearchPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: AccountViewModel[]
}

/**
 * Ctrl+K / Cmd+K command palette. Two result groups: static nav pages, and
 * account nicknames read live from the dashboard query cache (see TopNav —
 * no dedicated search endpoint exists on the backend). Selecting an account
 * navigates to /dashboard since there's no per-account detail route.
 */
export function SearchPalette({ open, onOpenChange, accounts }: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const matchedPages = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return ALL_NAV_LEAVES
    return ALL_NAV_LEAVES.filter((leaf) => leaf.label.toLowerCase().includes(q))
  }, [query])

  const matchedAccounts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return accounts
    return accounts.filter((account) => account.nickname.toLowerCase().includes(q))
  }, [accounts, query])

  const close = () => {
    onOpenChange(false)
    setQuery('')
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={(next) => (next ? onOpenChange(next) : close())}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-ft-navy/50 backdrop-blur-sm data-[state=open]:animate-[ft-fade-in_150ms_ease-out] data-[state=closed]:animate-[ft-fade-out_150ms_ease-in]" />
        <RadixDialog.Content className="fixed left-1/2 top-24 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border-strong bg-surface-elevated shadow-xl outline-none data-[state=open]:animate-[ft-scale-in_150ms_ease-out] data-[state=closed]:animate-[ft-scale-out_150ms_ease-in]">
          <RadixDialog.Title className="sr-only">Search</RadixDialog.Title>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages and accounts…"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            <kbd className="hidden shrink-0 rounded border border-border-strong px-1.5 py-0.5 text-[10px] text-text-muted sm:block">
              Esc
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {matchedPages.length === 0 && matchedAccounts.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-text-muted">No matches for "{query}".</p>
            )}

            {matchedPages.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Pages</p>
                {matchedPages.map((leaf) => (
                  <button
                    key={leaf.to}
                    type="button"
                    onClick={() => {
                      navigate(leaf.to)
                      close()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-text-primary hover:bg-surface-sunken"
                  >
                    <leaf.icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                    {leaf.label}
                  </button>
                ))}
              </div>
            )}

            {matchedAccounts.length > 0 && (
              <div>
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Accounts</p>
                {matchedAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      navigate('/dashboard')
                      close()
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm text-text-primary hover:bg-surface-sunken"
                  >
                    <span className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                      {account.nickname}
                    </span>
                    <span className="tabular-figure text-text-secondary">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.balance)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
