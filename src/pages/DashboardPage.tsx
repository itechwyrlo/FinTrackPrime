import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Wallet } from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import type { AccountViewModel, TransactionViewModel } from '../types/api'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { CreateAccountModal } from '../components/CreateAccountModal'
import { AddTransactionModal } from '../components/AddTransactionModal'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
}

function TransactionRow({ transaction }: { transaction: TransactionViewModel }) {
  const isExpense = transaction.direction === 'Expense'

  return (
    <li className="flex items-center justify-between rounded-md px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-text-primary">{transaction.description}</p>
        <p className="text-xs text-text-muted">
          {transaction.category} · {formatDate(transaction.occurredAtUtc)}
        </p>
      </div>
      <span className={`tabular-figure font-medium ${isExpense ? 'text-text-primary' : 'text-status-good'}`}>
        {isExpense ? '−' : '+'}
        {formatCurrency(transaction.amount)}
      </span>
    </li>
  )
}

function AccountCard({ account, onAddTransaction }: { account: AccountViewModel; onAddTransaction: () => void }) {
  return (
    <Card hoverElevate>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">{account.type}</p>
          <h2 className="font-display text-lg text-text-primary">{account.nickname}</h2>
        </div>
        <p className="tabular-figure font-display text-2xl text-text-primary">{formatCurrency(account.balance)}</p>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {account.recentTransactions.length === 0 ? (
          <li className="py-4 text-sm text-text-muted">No transactions yet.</li>
        ) : (
          account.recentTransactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
        )}
      </ul>

      <Button variant="ghost" size="sm" className="mt-3" leadingIcon={<Plus className="h-3.5 w-3.5" />} onClick={onAddTransaction}>
        Add transaction
      </Button>
    </Card>
  )
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  })
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false)
  const [addTransactionAccountId, setAddTransactionAccountId] = useState<string | null>(null)

  const summary = useMemo(() => {
    const accounts = data?.accounts ?? []
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
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

  return (
    <div>
      <CardHeader title="Your accounts" description="Every account you own, balance, and recent activity." />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total balance" value={formatCurrency(summary.totalBalance)} icon={<Wallet className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {data.accounts.map((account) => (
          <AccountCard key={account.id} account={account} onAddTransaction={() => setAddTransactionAccountId(account.id)} />
        ))}

        <button
          type="button"
          onClick={() => setIsCreateAccountOpen(true)}
          className="flex min-h-32 items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong text-sm font-medium text-ft-blue hover:bg-surface-elevated"
        >
          <Plus className="h-4 w-4" />
          Create an account
        </button>
      </div>

      <CreateAccountModal open={isCreateAccountOpen} onOpenChange={setIsCreateAccountOpen} />
      <AddTransactionModal
        open={addTransactionAccountId !== null}
        onOpenChange={(open) => !open && setAddTransactionAccountId(null)}
        initialAccountId={addTransactionAccountId ?? undefined}
      />
    </div>
  )
}
