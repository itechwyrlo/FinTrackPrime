import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, X } from 'lucide-react'
import { financialStatementApi } from '../api/financialStatement'
import { useDecimalInput } from '../hooks/useDecimalInput'
import type { AssetLineViewModel, LiabilityViewModel } from '../types/api'
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

export function FinancialStatementPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['financial-statement'],
    queryFn: financialStatementApi.get,
  })

  const [newLiabilityName, setNewLiabilityName] = useState('')
  const [newLiabilityAmount, setNewLiabilityAmount] = useState(0)
  const liabilityAmountInput = useDecimalInput({ value: newLiabilityAmount, onChange: setNewLiabilityAmount, decimals: 2 })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['financial-statement'] })

  const addMutation = useMutation({
    mutationFn: financialStatementApi.addLiability,
    onSuccess: () => {
      setNewLiabilityName('')
      setNewLiabilityAmount(0)
      invalidate()
    },
  })

  const removeMutation = useMutation({
    mutationFn: financialStatementApi.removeLiability,
    onSuccess: invalidate,
  })

  const handleAddLiability = () => {
    if (!newLiabilityName.trim() || newLiabilityAmount <= 0) return
    addMutation.mutate({ name: newLiabilityName.trim(), amount: newLiabilityAmount })
  }

  if (isLoading || !data) {
    return (
      <div>
        <div className="h-8 w-56 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const summaryChartData = [
    { name: 'Assets', amount: data.totalAssets },
    { name: 'Liabilities', amount: data.totalLiabilities },
  ]

  const assetColumns: TableColumn<AssetLineViewModel>[] = [
    { key: 'label', header: 'Asset', priority: 'high', render: (a) => a.label },
    {
      key: 'amount',
      header: 'Amount',
      priority: 'high',
      align: 'right',
      render: (a) => <span className="tabular-figure font-medium">{formatCurrency(a.amount)}</span>,
    },
  ]

  const liabilityColumns: TableColumn<LiabilityViewModel>[] = [
    { key: 'name', header: 'Liability', priority: 'high', render: (l) => l.name },
    {
      key: 'amount',
      header: 'Amount',
      priority: 'high',
      align: 'right',
      render: (l) => <span className="tabular-figure font-medium">{formatCurrency(l.amount)}</span>,
    },
    {
      key: 'remove',
      header: '',
      priority: 'high',
      align: 'right',
      render: (l) => (
        <IconButton
          icon={<X className="h-3.5 w-3.5" />}
          label={`Remove ${l.name}`}
          variant="ghost"
          size="sm"
          onClick={() => removeMutation.mutate(l.id)}
          className="text-text-muted hover:text-status-critical"
        />
      ),
    },
  ]

  return (
    <div>
      <CardHeader
        title="Financial Statement"
        description="Assets come from your accounts and investment holdings. Liabilities are entered manually below."
      />

      <StatCard label="Net worth" value={formatCurrency(data.netWorth)} className="text-center" />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">
            Assets — {formatCurrency(data.totalAssets)}
          </h2>
          <Table columns={assetColumns} data={data.assets} keyExtractor={(a) => a.label} emptyMessage="No assets on file." />
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">
            Liabilities — {formatCurrency(data.totalLiabilities)}
          </h2>
          <Table
            columns={liabilityColumns}
            data={data.liabilities}
            keyExtractor={(l) => l.id}
            emptyMessage="No liabilities added yet."
          />

          <Card className="mt-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Add a liability</p>
            <div className="flex flex-wrap items-end gap-3">
              <Input label="Name" value={newLiabilityName} onChange={(e) => setNewLiabilityName(e.target.value)} placeholder="Auto loan" className="w-36" />
              <Input label="Amount" variant="currency" {...liabilityAmountInput} className="w-32" />
              <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={handleAddLiability} isLoading={addMutation.isPending}>
                Add liability
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Assets vs. liabilities</h2>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryChartData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                <Cell fill="var(--color-chart-diverging-positive)" />
                <Cell fill="var(--color-chart-diverging-negative)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
