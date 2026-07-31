import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle } from 'lucide-react'
import { retirementPlannerApi } from '../api/retirementPlanner'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import type { RetirementPlanInputRequest, RetirementPlanViewModel } from '../types/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Slider } from '../components/ui/Slider'
import { StatCard } from '../components/ui/StatCard'
import { SkeletonCard } from '../components/ui/Skeleton'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function RetirementPlannerPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['retirement-planner'],
    queryFn: retirementPlannerApi.get,
  })

  const [plan, setPlan] = useState<RetirementPlanViewModel | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (data) setPlan(data)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: retirementPlannerApi.save,
    onSuccess: (result) => {
      setError(null)
      setPlan(result)
    },
    onError: () => setError('Retirement age must be after current age.'),
  })

  const saveDebounced = useDebouncedCallback((request: RetirementPlanInputRequest) => {
    saveMutation.mutate(request)
  }, 400)

  const updateField = (field: keyof RetirementPlanInputRequest, value: number) => {
    setPlan((prev) => {
      if (!prev) return prev
      const next = { ...prev, [field]: value }
      saveDebounced({
        currentAge: next.currentAge,
        retirementAge: next.retirementAge,
        currentSavings: next.currentSavings,
        monthlyContribution: next.monthlyContribution,
        annualReturnRatePercent: next.annualReturnRatePercent,
      })
      return next
    })
  }

  if (isLoading || !plan) {
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

  return (
    <div>
      <CardHeader title="Retirement Planner" description="Drag any slider. The projection redraws once you stop." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-6">
          <Slider
            label="Current age"
            value={plan.currentAge}
            min={18}
            max={80}
            formatValue={(v) => `${v}`}
            onValueChange={(v) => updateField('currentAge', v)}
          />
          <Slider
            label="Retirement age"
            value={plan.retirementAge}
            min={19}
            max={90}
            formatValue={(v) => `${v}`}
            onValueChange={(v) => updateField('retirementAge', v)}
          />
          <Slider
            label="Current savings"
            value={plan.currentSavings}
            min={0}
            max={500000}
            step={1000}
            formatValue={formatCurrency}
            onValueChange={(v) => updateField('currentSavings', v)}
          />
          <Slider
            label="Monthly contribution"
            value={plan.monthlyContribution}
            min={0}
            max={5000}
            step={50}
            formatValue={formatCurrency}
            onValueChange={(v) => updateField('monthlyContribution', v)}
          />
          <Slider
            label="Expected annual return"
            value={plan.annualReturnRatePercent}
            min={0}
            max={12}
            step={0.5}
            formatValue={(v) => `${v}%`}
            onValueChange={(v) => updateField('annualReturnRatePercent', v)}
          />
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-status-critical">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </Card>

        <div className="space-y-5">
          <StatCard
            label="Projected balance at retirement"
            value={formatCurrency(plan.projectedBalanceAtRetirement)}
            trend={{ direction: 'up', label: `at age ${plan.retirementAge}` }}
          />

          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Growth over time</h2>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={plan.projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                    label={{ value: 'Age', position: 'insideBottom', offset: -4, fontSize: 12, fill: 'var(--color-text-muted)' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => formatCurrency(v)} width={80} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} labelFormatter={(age) => `Age ${age}`} />
                  <Area
                    type="monotone"
                    dataKey="projectedBalance"
                    stroke="var(--color-chart-sequential-500)"
                    fill="var(--color-chart-sequential-500)"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
