import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, X } from 'lucide-react'
import { financialStatementApi } from '../api/financialStatement'
import { useDecimalInput } from '../hooks/useDecimalInput'
import type { AssetLineViewModel, AssetType, LiabilityType, LiabilityViewModel } from '../types/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select, type SelectOption } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'
import { StatCard } from '../components/ui/StatCard'
import { Table, type TableColumn } from '../components/ui/Table'
import { SkeletonCard } from '../components/ui/Skeleton'

// Each account (and now each asset/liability line) carries its own
// currency — falls back to a plain number + unit suffix for anything
// Intl doesn't recognize as a real ISO 4217 currency, same pattern
// DashboardPage.tsx uses.
function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  }
}

// Display order + label for each Type's group heading. Cash/Investment/
// Crypto/CreditCard groups only ever contain synced lines; the rest
// only ever contain manual ones.
const ASSET_TYPE_ORDER: { type: AssetType; label: string }[] = [
  { type: 'Cash', label: 'Cash & Bank Accounts' },
  { type: 'Investment', label: 'Investments' },
  { type: 'Crypto', label: 'Crypto' },
  { type: 'RealEstate', label: 'Real Estate' },
  { type: 'Vehicle', label: 'Vehicles' },
  { type: 'Other', label: 'Other Assets' },
]

const LIABILITY_TYPE_ORDER: { type: LiabilityType; label: string }[] = [
  { type: 'CreditCard', label: 'Credit Cards' },
  { type: 'Mortgage', label: 'Mortgages' },
  { type: 'AutoLoan', label: 'Auto Loans' },
  { type: 'StudentLoan', label: 'Student Loans' },
  { type: 'PersonalLoan', label: 'Personal Loans' },
  { type: 'Other', label: 'Other Liabilities' },
]

// Cash/Investment/Crypto excluded — those come from linked accounts,
// never a user-picked value in the "Add an asset" form.
const MANUAL_ASSET_TYPE_OPTIONS: SelectOption[] = [
  { value: 'RealEstate', label: 'Real Estate' },
  { value: 'Vehicle', label: 'Vehicle' },
  { value: 'Other', label: 'Other' },
]

// CreditCard excluded — that comes from a linked account, never a
// user-picked value in the "Add a liability" form.
const MANUAL_LIABILITY_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Mortgage', label: 'Mortgage' },
  { value: 'AutoLoan', label: 'Auto Loan' },
  { value: 'StudentLoan', label: 'Student Loan' },
  { value: 'PersonalLoan', label: 'Personal Loan' },
  { value: 'Other', label: 'Other' },
]

/**
 * One currency's worth of the statement: Assets / Liabilities / Owner's
 * Equity, plus the summary chart — rendered once for the primary
 * currency and once per entry in `otherCurrencies`, each fully
 * self-contained so multiple currencies are never visually implied to
 * be summed together. `manualAssetForm`/`manualLiabilityForm` are only
 * passed for the primary section — manual entries are always tagged
 * with the primary currency server-side (see FinancialStatementService),
 * so there's nowhere else for that form to make sense.
 */
function CurrencyStatementSection({
  currency,
  assets,
  totalAssets,
  liabilities,
  totalLiabilities,
  ownersEquity,
  assetColumns,
  liabilityColumns,
  manualAssetForm,
  manualLiabilityForm,
}: {
  currency: string
  assets: AssetLineViewModel[]
  totalAssets: number
  liabilities: LiabilityViewModel[]
  totalLiabilities: number
  ownersEquity: number
  assetColumns: TableColumn<AssetLineViewModel>[]
  liabilityColumns: TableColumn<LiabilityViewModel>[]
  manualAssetForm?: ReactNode
  manualLiabilityForm?: ReactNode
}) {
  const assetGroups = ASSET_TYPE_ORDER.map(({ type, label }) => ({
    type,
    label,
    lines: assets.filter((a) => a.type === type),
  })).filter((group) => group.lines.length > 0)

  const liabilityGroups = LIABILITY_TYPE_ORDER.map(({ type, label }) => ({
    type,
    label,
    lines: liabilities.filter((l) => l.type === type),
  })).filter((group) => group.lines.length > 0)

  const summaryChartData = [
    { name: 'Assets', amount: totalAssets },
    { name: 'Liabilities', amount: totalLiabilities },
    { name: "Owner's Equity", amount: ownersEquity },
  ]

  return (
    <div className="mb-8">
      <h2 className="mb-3 font-display text-lg text-text-primary">{currency}</h2>

      <div className="grid gap-5 lg:grid-cols-3">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">
            Assets — {formatCurrency(totalAssets, currency)}
          </h3>

          {assetGroups.length === 0 && (
            <Table columns={assetColumns} data={[]} keyExtractor={(a) => a.id ?? a.label} emptyMessage="No assets on file." />
          )}

          {assetGroups.map((group) => (
            <div key={group.type} className="mb-4">
              <p className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-text-secondary">
                <span>{group.label}</span>
                <span className="tabular-figure">{formatCurrency(group.lines.reduce((sum, a) => sum + a.amount, 0), currency)}</span>
              </p>
              <Table columns={assetColumns} data={group.lines} keyExtractor={(a) => a.id ?? a.label} />
            </div>
          ))}

          {manualAssetForm}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">
            Liabilities — {formatCurrency(totalLiabilities, currency)}
          </h3>

          {liabilityGroups.length === 0 && (
            <Table columns={liabilityColumns} data={[]} keyExtractor={(l) => l.id} emptyMessage="No liabilities on file." />
          )}

          {liabilityGroups.map((group) => (
            <div key={group.type} className="mb-4">
              <p className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-text-secondary">
                <span>{group.label}</span>
                <span className="tabular-figure">{formatCurrency(group.lines.reduce((sum, l) => sum + l.amount, 0), currency)}</span>
              </p>
              <Table columns={liabilityColumns} data={group.lines} keyExtractor={(l) => l.id} />
            </div>
          ))}

          {manualLiabilityForm}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Owner's Equity</h3>
          <StatCard label="Assets − Liabilities" value={formatCurrency(ownersEquity, currency)} className="text-center" />
          <p className="mt-3 text-xs text-text-muted">
            For an individual or self-employed account, Owner's Equity is what's left after everything owed is subtracted from everything owned — the
            same figure this statement used to call "Net Worth."
          </p>
        </div>
      </div>

      <Card className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Assets vs. liabilities vs. owner's equity</h3>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryChartData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                <Cell fill="var(--color-chart-diverging-positive)" />
                <Cell fill="var(--color-chart-diverging-negative)" />
                <Cell fill="var(--color-ft-gold)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

export function FinancialStatementPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['financial-statement'],
    queryFn: financialStatementApi.get,
  })

  const [newAssetName, setNewAssetName] = useState('')
  const [newAssetType, setNewAssetType] = useState<AssetType>('RealEstate')
  const [newAssetAmount, setNewAssetAmount] = useState(0)
  const assetAmountInput = useDecimalInput({ value: newAssetAmount, onChange: setNewAssetAmount, decimals: 2 })

  const [newLiabilityName, setNewLiabilityName] = useState('')
  const [newLiabilityType, setNewLiabilityType] = useState<LiabilityType>('Mortgage')
  const [newLiabilityAmount, setNewLiabilityAmount] = useState(0)
  const liabilityAmountInput = useDecimalInput({ value: newLiabilityAmount, onChange: setNewLiabilityAmount, decimals: 2 })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['financial-statement'] })

  const addAssetMutation = useMutation({
    mutationFn: financialStatementApi.addAsset,
    onSuccess: () => {
      setNewAssetName('')
      setNewAssetAmount(0)
      invalidate()
    },
  })

  const removeAssetMutation = useMutation({
    mutationFn: financialStatementApi.removeAsset,
    onSuccess: invalidate,
  })

  const addLiabilityMutation = useMutation({
    mutationFn: financialStatementApi.addLiability,
    onSuccess: () => {
      setNewLiabilityName('')
      setNewLiabilityAmount(0)
      invalidate()
    },
  })

  const removeLiabilityMutation = useMutation({
    mutationFn: financialStatementApi.removeLiability,
    onSuccess: invalidate,
  })

  const handleAddAsset = () => {
    if (!newAssetName.trim() || newAssetAmount <= 0) return
    addAssetMutation.mutate({ name: newAssetName.trim(), type: newAssetType, amount: newAssetAmount })
  }

  const handleAddLiability = () => {
    if (!newLiabilityName.trim() || newLiabilityAmount <= 0) return
    addLiabilityMutation.mutate({ name: newLiabilityName.trim(), type: newLiabilityType, amount: newLiabilityAmount })
  }

  if (isLoading || !data) {
    return (
      <div>
        <div className="h-8 w-56 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const assetColumns: TableColumn<AssetLineViewModel>[] = [
    { key: 'label', header: 'Asset', priority: 'high', render: (a) => a.label },
    {
      key: 'amount',
      header: 'Amount',
      priority: 'high',
      align: 'right',
      render: (a) => <span className="tabular-figure font-medium">{formatCurrency(a.amount, a.currency)}</span>,
    },
    {
      key: 'remove',
      header: '',
      priority: 'high',
      align: 'right',
      render: (a) =>
        a.id && (
          <IconButton
            icon={<X className="h-3.5 w-3.5" />}
            label={`Remove ${a.label}`}
            variant="ghost"
            size="sm"
            onClick={() => removeAssetMutation.mutate(a.id!)}
            className="text-text-muted hover:text-status-critical"
          />
        ),
    },
  ]

  const liabilityColumns: TableColumn<LiabilityViewModel>[] = [
    { key: 'name', header: 'Liability', priority: 'high', render: (l) => l.name },
    {
      key: 'amount',
      header: 'Amount',
      priority: 'high',
      align: 'right',
      render: (l) => <span className="tabular-figure font-medium">{formatCurrency(l.amount, l.currency)}</span>,
    },
    {
      key: 'remove',
      header: '',
      priority: 'high',
      align: 'right',
      render: (l) =>
        l.type !== 'CreditCard' && (
          <IconButton
            icon={<X className="h-3.5 w-3.5" />}
            label={`Remove ${l.name}`}
            variant="ghost"
            size="sm"
            onClick={() => removeLiabilityMutation.mutate(l.id)}
            className="text-text-muted hover:text-status-critical"
          />
        ),
    },
  ]

  const manualAssetForm = (
    <Card className="mt-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Add an asset</p>
      <div className="flex flex-col gap-3">
        <Input label="Name" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} placeholder="Home" />
        <Select
          label="Type"
          options={MANUAL_ASSET_TYPE_OPTIONS}
          value={newAssetType}
          onValueChange={(value) => setNewAssetType(value as AssetType)}
        />
        <Input label="Amount" variant="currency" {...assetAmountInput} />
        <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={handleAddAsset} isLoading={addAssetMutation.isPending}>
          Add asset
        </Button>
      </div>
    </Card>
  )

  const manualLiabilityForm = (
    <Card className="mt-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Add a liability</p>
      <div className="flex flex-col gap-3">
        <Input label="Name" value={newLiabilityName} onChange={(e) => setNewLiabilityName(e.target.value)} placeholder="Auto loan" />
        <Select
          label="Type"
          options={MANUAL_LIABILITY_TYPE_OPTIONS}
          value={newLiabilityType}
          onValueChange={(value) => setNewLiabilityType(value as LiabilityType)}
        />
        <Input label="Amount" variant="currency" {...liabilityAmountInput} />
        <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={handleAddLiability} isLoading={addLiabilityMutation.isPending}>
          Add liability
        </Button>
      </div>
    </Card>
  )

  return (
    <div>
      <CardHeader
        title="Financial Statement"
        description="Assets come from your accounts, investment holdings, and anything you add manually below. Liabilities are entered manually, alongside any linked credit cards."
      />

      <div className="mt-5">
        <CurrencyStatementSection
          currency={data.currency}
          assets={data.assets}
          totalAssets={data.totalAssets}
          liabilities={data.liabilities}
          totalLiabilities={data.totalLiabilities}
          ownersEquity={data.ownersEquity}
          assetColumns={assetColumns}
          liabilityColumns={liabilityColumns}
          manualAssetForm={manualAssetForm}
          manualLiabilityForm={manualLiabilityForm}
        />

        {data.otherCurrencies.map((bucket) => (
          <CurrencyStatementSection
            key={bucket.currency}
            currency={bucket.currency}
            assets={bucket.assets}
            totalAssets={bucket.totalAssets}
            liabilities={bucket.liabilities}
            totalLiabilities={bucket.totalLiabilities}
            ownersEquity={bucket.ownersEquity}
            assetColumns={assetColumns}
            liabilityColumns={liabilityColumns}
          />
        ))}
      </div>
    </div>
  )
}
