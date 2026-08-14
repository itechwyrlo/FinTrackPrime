import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cashFlowApi } from '../api/cashFlow'
import { Card, CardHeader } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonChart } from '../components/ui/Skeleton'

// currency comes from the API response (CashFlowViewModel.currency) —
// whichever currency has the most transactions, not a hardcoded guess.
// Previously this always formatted as USD regardless of what the
// underlying accounts actually held (HKD, SGD, ...), which was wrong
// even before multi-currency handling existed on the backend.
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount)
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function CashFlowPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cash-flow'],
    queryFn: cashFlowApi.get,
  })

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-56 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <StatCard label="" value="" isLoading />
          <StatCard label="" value="" isLoading />
          <StatCard label="" value="" isLoading />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Couldn't load cash flow data"
        description="Something went wrong fetching your cash flow."
        action={<Button onClick={() => refetch()}>Try again</Button>}
      />
    )
  }

  const trendData = data.monthlyTrend.map((m) => ({
    label: `${MONTH_LABELS[m.month - 1]} ${m.year}`,
    Income: m.income,
    Expenses: m.expenses,
  }))

  const categoryData = data.expenseByCategory.map((c) => ({ name: c.category, amount: c.amount }))

  return (
    <div>
      <CardHeader title="Cash Flow Dashboard" description="Built from the same transactions behind your account dashboard." />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label={`Total income (${data.currency})`} value={formatCurrency(data.totalIncome, data.currency)} />
        <StatCard label={`Total expenses (${data.currency})`} value={formatCurrency(data.totalExpenses, data.currency)} />
        <StatCard
          label="Net"
          value={formatCurrency(data.net, data.currency)}
          trend={{ direction: data.net < 0 ? 'down' : 'up', label: data.net < 0 ? 'Negative this period' : 'Positive this period' }}
        />
      </div>

      {data.otherCurrencies.length > 0 && (
        <p className="mt-3 text-xs text-text-muted">
          Also holds accounts in{' '}
          {data.otherCurrencies.map((c) => c.currency).join(', ')} — not converted or included in the totals above.
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Expenses by category</h2>
          <div className="mt-3 h-64">
            {categoryData.length === 0 ? (
              <p className="text-sm text-text-muted">No expense transactions yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), data.currency)} />
                  <Bar dataKey="amount" fill="var(--color-chart-series-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Monthly trend</h2>
          <div className="mt-3 h-64">
            {trendData.length === 0 ? (
              <p className="text-sm text-text-muted">Not enough history yet for a trend line.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), data.currency)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Income" stroke="var(--color-chart-series-1)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Expenses" stroke="var(--color-chart-series-2)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
