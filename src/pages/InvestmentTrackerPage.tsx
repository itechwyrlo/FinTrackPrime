import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Plus, X } from 'lucide-react'
import { investmentTrackerApi } from '../api/investmentTracker'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import type { InvestmentHoldingViewModel } from '../types/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'
import { StatCard } from '../components/ui/StatCard'
import { Table, type TableColumn } from '../components/ui/Table'
import { SkeletonCard } from '../components/ui/Skeleton'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// Only the first three categorical slots clear the all-pairs CVD guarantee
// for a pie chart (see Phase 1 spec) — a 4th+ holding folds into "Other".
const ALLOCATION_COLORS = ['var(--color-chart-series-1)', 'var(--color-chart-series-2)', 'var(--color-chart-series-3)']
const OTHER_COLOR = 'var(--color-chart-other)'
const MAX_DIRECT_SLICES = 3

export function InvestmentTrackerPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['investment-tracker'],
    queryFn: investmentTrackerApi.get,
  })

  const [holdings, setHoldings] = useState<InvestmentHoldingViewModel[]>([])
  const [newSymbol, setNewSymbol] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (data) setHoldings(data.holdings)
  }, [data])

  const updateMutation = useMutation({
    mutationFn: ({ id, shares, costBasisPerShare, currentPricePerShare }: InvestmentHoldingViewModel) =>
      investmentTrackerApi.updateHolding(id, { shares, costBasisPerShare, currentPricePerShare }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['investment-tracker'] }),
  })

  const addMutation = useMutation({
    mutationFn: investmentTrackerApi.addHolding,
    onSuccess: () => {
      setNewSymbol('')
      setNewName('')
      queryClient.invalidateQueries({ queryKey: ['investment-tracker'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: investmentTrackerApi.removeHolding,
  })

  const saveDebounced = useDebouncedCallback(
    (holding: InvestmentHoldingViewModel) => updateMutation.mutate(holding),
    500,
  )

  const updateHoldingField = (id: string, field: 'shares' | 'costBasisPerShare' | 'currentPricePerShare', value: number) => {
    let updated: InvestmentHoldingViewModel | undefined
    setHoldings((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h
        updated = { ...h, [field]: value }
        return updated
      }),
    )
    if (updated) saveDebounced(updated)
  }

  const handleRemove = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id))
    removeMutation.mutate(id)
  }

  const handleAdd = () => {
    if (!newSymbol.trim() || !newName.trim()) return
    addMutation.mutate({
      symbol: newSymbol.trim(),
      name: newName.trim(),
      shares: 1,
      costBasisPerShare: 0,
      currentPricePerShare: 0,
    })
  }

  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPricePerShare, 0)
  const totalCostBasis = holdings.reduce((sum, h) => sum + h.shares * h.costBasisPerShare, 0)
  const totalGainLoss = totalCurrentValue - totalCostBasis

  const allocationSource = holdings
    .map((h) => ({ name: h.symbol, value: h.shares * h.currentPricePerShare }))
    .filter((h) => h.value > 0)
    .sort((a, b) => b.value - a.value)

  const chartData =
    allocationSource.length > MAX_DIRECT_SLICES
      ? [
          ...allocationSource.slice(0, MAX_DIRECT_SLICES),
          { name: 'Other', value: allocationSource.slice(MAX_DIRECT_SLICES).reduce((sum, h) => sum + h.value, 0) },
        ]
      : allocationSource

  const columns: TableColumn<InvestmentHoldingViewModel>[] = [
    {
      key: 'symbol',
      header: 'Symbol',
      priority: 'high',
      render: (h) => (
        <div>
          <p className="font-medium text-text-primary">{h.symbol}</p>
          <p className="text-xs text-text-muted">{h.name}</p>
        </div>
      ),
    },
    {
      key: 'shares',
      header: 'Shares',
      priority: 'high',
      render: (h) => (
        <input
          type="number"
          min={0}
          step={0.0001}
          value={h.shares}
          onChange={(e) => updateHoldingField(h.id, 'shares', Number(e.target.value))}
          className="tabular-figure w-20 rounded-md border border-border-strong bg-surface px-2 py-1 text-text-primary outline-none focus:border-ft-blue"
        />
      ),
    },
    {
      key: 'costBasisPerShare',
      header: 'Cost/share',
      priority: 'medium',
      render: (h) => (
        <input
          type="number"
          min={0}
          step={0.01}
          value={h.costBasisPerShare}
          onChange={(e) => updateHoldingField(h.id, 'costBasisPerShare', Number(e.target.value))}
          className="tabular-figure w-24 rounded-md border border-border-strong bg-surface px-2 py-1 text-text-primary outline-none focus:border-ft-blue"
        />
      ),
    },
    {
      key: 'currentPricePerShare',
      header: 'Price/share',
      priority: 'medium',
      render: (h) => (
        <input
          type="number"
          min={0}
          step={0.01}
          value={h.currentPricePerShare}
          onChange={(e) => updateHoldingField(h.id, 'currentPricePerShare', Number(e.target.value))}
          className="tabular-figure w-24 rounded-md border border-border-strong bg-surface px-2 py-1 text-text-primary outline-none focus:border-ft-blue"
        />
      ),
    },
    {
      key: 'value',
      header: 'Value',
      priority: 'high',
      align: 'right',
      render: (h) => <span className="tabular-figure font-medium">{formatCurrency(h.shares * h.currentPricePerShare)}</span>,
    },
    {
      key: 'gainLoss',
      header: 'Gain/loss',
      priority: 'high',
      align: 'right',
      render: (h) => {
        const gainLoss = h.shares * h.currentPricePerShare - h.shares * h.costBasisPerShare
        return (
          <span className={`tabular-figure font-medium ${gainLoss < 0 ? 'text-status-critical' : 'text-status-good'}`}>
            {formatCurrency(gainLoss)}
          </span>
        )
      },
    },
    {
      key: 'remove',
      header: '',
      priority: 'high',
      align: 'right',
      render: (h) => (
        <IconButton
          icon={<X className="h-3.5 w-3.5" />}
          label={`Remove ${h.symbol}`}
          variant="ghost"
          size="sm"
          onClick={() => handleRemove(h.id)}
          className="text-text-muted hover:text-status-critical"
        />
      ),
    },
  ]

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-64 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div>
      <CardHeader
        title="Investment Portfolio Tracker"
        description="Prices are entered manually, edit any field and totals update as you type."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Table columns={columns} data={holdings} keyExtractor={(h) => h.id} emptyMessage="Add a holding to get started." />

          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Add a holding</p>
            <div className="flex flex-wrap items-end gap-3">
              <Input label="Symbol" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} placeholder="AAPL" className="w-28" />
              <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Apple Inc." className="w-48" />
              <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={handleAdd} isLoading={addMutation.isPending}>
                Add holding
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3">
            <StatCard label="Current value" value={formatCurrency(totalCurrentValue)} />
            <StatCard label="Cost basis" value={formatCurrency(totalCostBasis)} />
            <StatCard
              label="Gain/loss"
              value={formatCurrency(totalGainLoss)}
              trend={{ direction: totalGainLoss < 0 ? 'down' : 'up', label: totalGainLoss < 0 ? 'Below cost basis' : 'Above cost basis' }}
            />
          </div>

          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Allocation</h2>
            <div className="mt-3 h-56">
              {chartData.length === 0 ? (
                <p className="text-sm text-text-muted">Add holdings to see allocation.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={70}>
                      {chartData.map((entry, i) => (
                        <Cell key={entry.name} fill={i < MAX_DIRECT_SLICES ? ALLOCATION_COLORS[i] : OTHER_COLOR} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
