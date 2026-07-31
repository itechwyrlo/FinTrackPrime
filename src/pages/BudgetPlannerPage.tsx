import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, X } from 'lucide-react'
import { budgetPlannerApi } from '../api/budgetPlanner'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { amountInputValue, parseAmountInput } from '../utils/number'
import type { BudgetCategoryType, BudgetCategoryViewModel } from '../types/api'
import { Card, CardHeader } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function CategoryRow({
  category,
  onNameChange,
  onAmountChange,
  onRemove,
}: {
  category: BudgetCategoryViewModel
  onNameChange: (id: string, name: string) => void
  onAmountChange: (id: string, amount: number) => void
  onRemove: (id: string) => void
}) {
  return (
    <li className="flex items-center gap-2 py-2">
      <input
        value={category.name}
        onChange={(e) => onNameChange(category.id, e.target.value)}
        aria-label="Category name"
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-text-primary hover:border-border-strong focus:border-ft-blue focus:bg-surface-elevated focus:outline-none"
      />
      <div className="flex items-center gap-1 rounded-md border border-border-strong bg-surface-elevated px-2 py-1">
        <span className="text-sm text-text-muted">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={amountInputValue(category.plannedAmount)}
          onChange={(e) => onAmountChange(category.id, parseAmountInput(e.target.value))}
          aria-label={`Planned amount for ${category.name}`}
          className="tabular-figure w-20 bg-transparent text-sm text-text-primary outline-none"
        />
      </div>
      <IconButton
        icon={<X className="h-3.5 w-3.5" />}
        label={`Remove ${category.name}`}
        variant="ghost"
        size="sm"
        onClick={() => onRemove(category.id)}
        className="text-text-muted hover:text-status-critical"
      />
    </li>
  )
}

export function BudgetPlannerPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['budget-planner'],
    queryFn: budgetPlannerApi.get,
  })

  // A local editable copy: typing updates this immediately so totals
  // and the chart react on every keystroke, independent of network
  // latency. Only re-synced from the server when the categories list
  // itself changes shape (add/remove), not on every render.
  const [categories, setCategories] = useState<BudgetCategoryViewModel[]>([])

  useEffect(() => {
    if (data) setCategories(data.categories)
  }, [data])

  const updateMutation = useMutation({
    mutationFn: ({ id, name, plannedAmount }: { id: string; name: string; plannedAmount: number }) =>
      budgetPlannerApi.updateCategory(id, { name, plannedAmount }),
  })

  const addMutation = useMutation({
    // The backend's CreateBudgetCategoryRequest.Name is [Required] and
    // rejects an empty string, so a real starter name goes here instead
    // of blank. The user can still rename it inline right after.
    mutationFn: (type: BudgetCategoryType) =>
      budgetPlannerApi.addCategory({
        type,
        name: type === 'Income' ? 'New income source' : 'New expense',
      }),
    onSuccess: (created) => setCategories((prev) => [...prev, created]),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => budgetPlannerApi.removeCategory(id),
  })

  const saveDebounced = useDebouncedCallback(
    (id: string, name: string, plannedAmount: number) => updateMutation.mutate({ id, name, plannedAmount }),
    500,
  )

  const handleNameChange = (id: string, name: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
    const category = categories.find((c) => c.id === id)
    saveDebounced(id, name, category?.plannedAmount ?? 0)
  }

  const handleAmountChange = (id: string, plannedAmount: number) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, plannedAmount } : c)))
    const category = categories.find((c) => c.id === id)
    saveDebounced(id, category?.name ?? '', plannedAmount)
  }

  const handleRemove = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    removeMutation.mutate(id)
  }

  const handleAdd = (type: BudgetCategoryType) => {
    addMutation.mutate(type, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['budget-planner'] }),
    })
  }

  const income = categories.filter((c) => c.type === 'Income')
  const expenses = categories.filter((c) => c.type === 'Expense')

  const totals = useMemo(() => {
    const totalIncome = income.reduce((sum, c) => sum + c.plannedAmount, 0)
    const totalExpenses = expenses.reduce((sum, c) => sum + c.plannedAmount, 0)
    return { totalIncome, totalExpenses, net: totalIncome - totalExpenses }
  }, [income, expenses])

  const chartData = expenses
    .filter((c) => c.plannedAmount > 0)
    .map((c) => ({ name: c.name || 'Untitled', amount: c.plannedAmount }))

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  return (
    <div>
      <CardHeader title="Budget Planner" description="Edit any amount below. Totals and the chart update as you type." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Income</h2>
          <ul className="mt-2 divide-y divide-border">
            {income.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onNameChange={handleNameChange}
                onAmountChange={handleAmountChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3" leadingIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => handleAdd('Income')}>
            Add income source
          </Button>
        </Card>

        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Expenses</h2>
          <ul className="mt-2 divide-y divide-border">
            {expenses.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onNameChange={handleNameChange}
                onAmountChange={handleAmountChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3" leadingIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => handleAdd('Expense')}>
            Add expense category
          </Button>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:content-start">
          <StatCard label="Total income" value={formatCurrency(totals.totalIncome)} />
          <StatCard label="Total expenses" value={formatCurrency(totals.totalExpenses)} />
          <StatCard
            label="Net"
            value={formatCurrency(totals.net)}
            trend={{ direction: totals.net < 0 ? 'down' : 'up', label: totals.net < 0 ? 'Over budget' : 'On track' }}
          />
        </div>

        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Expense breakdown</h2>
          <div className="mt-3 h-48">
            {chartData.length === 0 ? (
              <p className="text-sm text-text-muted">Add expense amounts to see the breakdown.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" fill="var(--color-chart-series-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
