import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { loanCalculatorApi } from '../api/loanCalculator'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { useDecimalInput } from '../hooks/useDecimalInput'
import type { AffordabilityRating, LoanCalculationRequest } from '../types/api'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'
import { Spinner } from '../components/ui/Spinner'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

const DEFAULT_REQUEST: LoanCalculationRequest = {
  principalAmount: 25000,
  annualInterestRatePercent: 6.5,
  termMonths: 60,
  extraMonthlyPayment: 0,
}

const RATING_BADGE_VARIANT: Record<AffordabilityRating, 'neutral' | 'good' | 'gold' | 'warning' | 'critical'> = {
  Unknown: 'neutral',
  Comfortable: 'good',
  Manageable: 'gold',
  Stretched: 'warning',
  NotRecommended: 'critical',
}

const RATING_LABEL: Record<AffordabilityRating, string> = {
  Unknown: 'Unknown',
  Comfortable: 'Comfortable',
  Manageable: 'Manageable',
  Stretched: 'Stretched',
  NotRecommended: 'Not recommended',
}

export function LoanCalculatorPage() {
  const navigate = useNavigate()
  const [request, setRequest] = useState<LoanCalculationRequest>(DEFAULT_REQUEST)

  const mutation = useMutation({
    mutationFn: loanCalculatorApi.calculate,
  })

  const runCalculation = useDebouncedCallback((req: LoanCalculationRequest) => {
    mutation.mutate(req)
  }, 400)

  // Runs once on mount for the default scenario, then again every time
  // an input changes (debounced), so the results pane is never empty.
  useEffect(() => {
    runCalculation(request)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request])

  const affordabilityMutation = useMutation({
    mutationFn: loanCalculatorApi.checkAffordability,
  })

  const runAffordabilityCheck = useDebouncedCallback(
    (req: { principalAmount: number; annualInterestRatePercent: number; termMonths: number }) => {
      affordabilityMutation.mutate(req)
    },
    400,
  )

  // Mirrors the loan being calculated above, so affordability always reflects
  // the same principal/rate/term the user is currently looking at.
  useEffect(() => {
    runAffordabilityCheck({
      principalAmount: request.principalAmount,
      annualInterestRatePercent: request.annualInterestRatePercent,
      termMonths: request.termMonths,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.principalAmount, request.annualInterestRatePercent, request.termMonths])

  const updateField = (field: keyof LoanCalculationRequest, value: number) => {
    setRequest((prev) => ({ ...prev, [field]: value }))
  }

  const principalInput = useDecimalInput({
    value: request.principalAmount,
    onChange: (value) => updateField('principalAmount', value),
    decimals: 2,
  })
  const rateInput = useDecimalInput({
    value: request.annualInterestRatePercent,
    onChange: (value) => updateField('annualInterestRatePercent', value),
    decimals: 1,
  })
  const termInput = useDecimalInput({
    value: request.termMonths,
    onChange: (value) => updateField('termMonths', value),
    decimals: 0,
  })
  const extraPaymentInput = useDecimalInput({
    value: request.extraMonthlyPayment,
    onChange: (value) => updateField('extraMonthlyPayment', value),
    decimals: 2,
  })

  const result = mutation.data
  const chartData = result?.schedule.map((row) => ({
    month: row.month,
    Balance: row.remainingBalance,
  }))

  return (
    <div>
      <CardHeader
        title="Loan Calculator"
        description="Adjust any field. The payment, payoff time, and balance chart recalculate as you go."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <Input label="Loan amount" variant="currency" {...principalInput} />
          <Input label="Annual interest rate" variant="percent" {...rateInput} />
          <Input label="Term (months)" {...termInput} />
          <Input
            label="Extra monthly payment"
            variant="currency"
            {...extraPaymentInput}
            helperText="Optional. See how much sooner extra payments pay off the loan."
          />
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Results</h2>
            {result ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <StatCard label="Monthly payment" value={formatCurrency(result.requiredMonthlyPayment)} />
                <StatCard label="Payoff time" value={`${result.payoffMonths} months`} />
                <StatCard label="Total interest" value={formatCurrency(result.totalInterestPaid)} />
                <StatCard label="Total paid" value={formatCurrency(result.totalPaid)} />
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
                <Spinner size="sm" /> Calculating…
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">Remaining balance over time</h2>
            <div className="mt-3 h-56">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                      label={{ value: 'Month', position: 'insideBottom', offset: -4, fontSize: 12, fill: 'var(--color-text-muted)' }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} labelFormatter={(m) => `Month ${m}`} />
                    <Line type="monotone" dataKey="Balance" stroke="var(--color-chart-sequential-500)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex items-center gap-2 text-sm text-text-muted">
                  <Spinner size="sm" /> Calculating…
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ft-gold-ink dark:text-ft-gold">
                Can you afford this loan?
              </h2>
              {affordabilityMutation.data && (
                <Badge variant={RATING_BADGE_VARIANT[affordabilityMutation.data.rating]}>
                  {RATING_LABEL[affordabilityMutation.data.rating]}
                </Badge>
              )}
            </div>

            {!affordabilityMutation.data ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
                <Spinner size="sm" /> Checking…
              </p>
            ) : affordabilityMutation.data.rating === 'Unknown' ? (
              <div className="mt-3">
                <EmptyState
                  title="Add an income category to check affordability"
                  description="We use your Budget Planner income categories to estimate whether this loan fits your budget."
                  action={<Button onClick={() => navigate('/budget-planner')}>Go to Budget Planner</Button>}
                />
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <StatCard label="Proposed payment" value={formatCurrency(affordabilityMutation.data.proposedMonthlyPayment)} />
                <StatCard label="Monthly income" value={formatCurrency(affordabilityMutation.data.monthlyIncome)} />
                <StatCard
                  label="Current debt-to-income"
                  value={
                    affordabilityMutation.data.currentDebtToIncomeRatioPercent === null
                      ? '—'
                      : formatPercent(affordabilityMutation.data.currentDebtToIncomeRatioPercent)
                  }
                />
                <StatCard
                  label="Projected debt-to-income"
                  value={
                    affordabilityMutation.data.projectedDebtToIncomeRatioPercent === null
                      ? '—'
                      : formatPercent(affordabilityMutation.data.projectedDebtToIncomeRatioPercent)
                  }
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
