import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Landmark, RefreshCw, Wallet } from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import { useBankLink } from '../hooks/useBankLink'
import type { AccountType, AccountViewModel, TransactionViewModel } from '../types/api'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'

// Each account carries its own currency now (account.currency) instead of
// everything being formatted as USD regardless of what it actually was.
// Falls back to a plain number + unit suffix for anything Intl doesn't
// recognize as a real ISO 4217 currency — Unsupported accounts (Bitcoin,
// etc.) report "BTC", which isn't a fiat currency and makes
// Intl.NumberFormat throw rather than silently coerce.
function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  Checking: 'Checking',
  Savings: 'Savings',
  CreditCard: 'Credit Card',
  Other: 'Other',
  Crypto: 'Crypto',
  Unsupported: 'Unsupported',
}

function TransactionRow({ transaction, currency }: { transaction: TransactionViewModel; currency: string }) {
  // Transfer (a credit card payment, a bank transfer) is neither real
  // spending nor real income — rendered with a neutral sign/color instead
  // of being lumped in with Income's "+" and green like it used to be.
  const sign = transaction.direction === 'Expense' ? '−' : transaction.direction === 'Transfer' ? '⇄' : '+'
  const colorClass =
    transaction.direction === 'Expense'
      ? 'text-text-primary'
      : transaction.direction === 'Transfer'
        ? 'text-text-muted'
        : 'text-status-good'

  return (
    <li className="flex items-center justify-between rounded-md px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-text-primary">{transaction.description}</p>
        <p className="text-xs text-text-muted">
          {/* Category is blank for bank-synced transactions (Finverse has
              no category field) — skip the separator rather than show a
              dangling "· Nov 11". */}
          {transaction.category ? `${transaction.category} · ` : ''}
          {formatDate(transaction.occurredAtUtc)}
        </p>
      </div>
      <span className={`tabular-figure font-medium ${colorClass}`}>
        {sign}
        {formatCurrency(transaction.amount, currency)}
      </span>
    </li>
  )
}

function AccountCard({ account }: { account: AccountViewModel }) {
  const isUnsupported = account.type === 'Unsupported'
  const isCrypto = account.type === 'Crypto'

  return (
    <Card hoverElevate>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">
            {ACCOUNT_TYPE_LABELS[account.type]}
          </p>
          <h2 className="font-display text-lg text-text-primary">{account.nickname}</h2>
        </div>
        <p className="tabular-figure font-display text-2xl text-text-primary">
          {formatCurrency(account.balance, account.currency)}
        </p>
      </div>

      {isUnsupported && (
        <p className="mt-2 text-xs text-text-muted">
          Not supported yet — balance shown above, but excluded from Total balance, Cash Flow, and the Financial
          Statement. No transactions are synced for it.
        </p>
      )}

      {isCrypto && (
        <p className="mt-2 text-xs text-text-muted">
          Converted to its dollar value for your Financial Statement using the last synced price — not included in
          Cash Flow.
        </p>
      )}

      <ul className="mt-4 divide-y divide-border">
        {account.recentTransactions.length === 0 ? (
          <li className="py-4 text-sm text-text-muted">No transactions yet.</li>
        ) : (
          account.recentTransactions.map((t) => <TransactionRow key={t.id} transaction={t} currency={account.currency} />)
        )}
      </ul>
    </Card>
  )
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  })
  const { connect, sync } = useBankLink()

  const summary = useMemo(() => {
    const accounts = data?.accounts ?? []
    // Unsupported accounts (Bitcoin, FX wallets — see AccountType) carry a
    // balance in whatever unit Finverse reported, not this user's home
    // currency. Excluded here for the same reason the backend's Financial
    // Statement excludes them from net worth: no conversion rate exists to
    // safely add it into a single-currency total.
    // Other accounts count toward this the same as Checking/Savings
    // (the pre-existing cross-currency blending this naive sum has for
    // e.g. HKD + SGD accounts is unchanged, not fixed here). Crypto
    // still doesn't — its raw balance isn't a dollar figure without the
    // conversion this sum doesn't do.
    const totalBalance = accounts
      .filter((account) => account.type !== 'Unsupported' && account.type !== 'Crypto')
      .reduce((sum, account) => sum + account.balance, 0)
    return { totalBalance }
  }, [data])

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <StatCard label="" value="" isLoading />
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Couldn't load your dashboard"
        description="Something went wrong fetching your accounts."
        action={<Button onClick={() => refetch()}>Try again</Button>}
      />
    )
  }

  if (data.accounts.length === 0) {
    return (
      <EmptyState
        icon={<Landmark className="h-8 w-8" />}
        title="Connect your first bank account"
        description="Link a real (or sandbox) bank account to see balances and transactions here — nothing is entered by hand."
        action={
          <Button isLoading={connect.isPending} onClick={() => connect.mutate()}>
            Connect a bank
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <CardHeader
        title="Your accounts"
        description="Every account you've linked, its balance, and recent activity."
        action={
          <Button
            variant="secondary"
            size="sm"
            isLoading={sync.isPending}
            leadingIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => sync.mutate()}
          >
            Sync
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Still blends every included account's currency into one number
            (HKD + SGD, in the demo data) — same known gap as Cash Flow's
            pre-fix totals, just not addressed here yet. Not attempting a
            currency label since there isn't one single correct answer. */}
        <StatCard label="Total balance" value={formatCurrency(summary.totalBalance, '')} icon={<Wallet className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {data.accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}

        <button
          type="button"
          onClick={() => connect.mutate()}
          disabled={connect.isPending}
          className="flex min-h-32 items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong text-sm font-medium text-ft-blue hover:bg-surface-elevated disabled:opacity-60"
        >
          <Landmark className="h-4 w-4" />
          {connect.isPending ? 'Connecting…' : 'Connect another bank'}
        </button>
      </div>
    </div>
  )
}
