import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { loanCalculatorApi } from '../api/loanCalculator'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { useDecimalInput } from '../hooks/useDecimalInput'
import type { AffordabilityRating, AmortizationMethod, LiabilityType, LoanCalculationRequest } from '../types/api'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Select, type SelectOption } from '../components/ui/Select'
import { StatCard } from '../components/ui/StatCard'
import { Spinner } from '../components/ui/Spinner'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

const LOAN_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Mortgage', label: 'Mortgage' },
  { value: 'AutoLoan', label: 'Auto Loan' },
  { value: 'StudentLoan', label: 'Student Loan' },
  { value: 'PersonalLoan', label: 'Personal Loan' },
  { value: 'Other', label: 'Other' },
]

const METHOD_OPTIONS: SelectOption[] = [
  { value: 'Equal', label: 'Fixed Equal Amortization Case' },
  { value: 'FixedPrincipal', label: 'Fixed Principal Amortization Case' },
  { value: 'GracePeriod', label: 'Fixed Equal Amortization Case with Grace Period' },
  { value: 'Balloon', label: 'Periodic Interest Payment, Balloon Payment at Maturity' },
]

const DEFAULT_REQUEST: LoanCalculationRequest = {
  principalAmount: 25000,
  loanType: 'PersonalLoan',
  termMonths: 60,
  extraMonthlyPayment: 0,
  method: 'Equal',
  gracePeriodMonths: undefined,
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

  const { data: rates } = useQuery({ queryKey: ['loan-rates'], queryFn: loanCalculatorApi.getRates })
  const currentRate = rates?.find((r) => r.type === request.loanType)?.annualRatePercent

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
    (req: { principalAmount: number; loanType: LiabilityType; termMonths: number; method: AmortizationMethod; gracePeriodMonths?: number }) => {
      affordabilityMutation.mutate(req)
    },
    400,
  )

  // Mirrors the loan being calculated above, so affordability always reflects
  // the same principal/type/term/method the user is currently looking at.
  useEffect(() => {
    runAffordabilityCheck({
      principalAmount: request.principalAmount,
      loanType: request.loanType,
      termMonths: request.termMonths,
      method: request.method,
      gracePeriodMonths: request.gracePeriodMonths,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.principalAmount, request.loanType, request.termMonths, request.method, request.gracePeriodMonths])

  const updateField = <K extends keyof LoanCalculationRequest>(field: K, value: LoanCalculationRequest[K]) => {
    setRequest((prev) => ({ ...prev, [field]: value }))
  }

  const principalInput = useDecimalInput({
    value: request.principalAmount,
    onChange: (value) => updateField('principalAmount', value),
    decimals: 2,
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
  const gracePeriodInput = useDecimalInput({
    value: request.gracePeriodMonths ?? 0,
    onChange: (value) => updateField('gracePeriodMonths', value),
    decimals: 0,
  })

  const result = mutation.data
  const chartData = result?.schedule.map((row) => ({
    month: row.month,
    Balance: row.remainingBalance,
  }))

  const paymentLabel = request.method === 'Equal' ? 'Monthly payment' : 'First payment'

  return (
    <div>
      <CardHeader
        title="Loan Calculator"
        description="Pick a loan type and amortization method. The rate is set by the bank and can't be changed."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <Input label="Loan amount" variant="currency" {...principalInput} />

          <Select
            label="Loan Type"
            options={LOAN_TYPE_OPTIONS}
            value={request.loanType}
            onValueChange={(value) => updateField('loanType', value as LiabilityType)}
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-text-primary">Bank rate</p>
            <div className="flex h-[42px] items-center rounded-lg border border-border-strong bg-surface-sunken px-3 text-sm text-text-secondary">
              {currentRate === undefined ? <Spinner size="sm" /> : formatPercent(currentRate)}
            </div>
          </div>

          <Select
            label="Type of Loan"
            options={METHOD_OPTIONS}
            value={request.method}
            onValueChange={(value) => updateField('method', value as AmortizationMethod)}
          />

          {request.method === 'GracePeriod' && (
            <Input
              label="Grace period (months)"
              {...gracePeriodInput}
              helperText="Interest-only for this many months before regular payments begin."
            />
          )}

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
                <StatCard label={paymentLabel} value={formatCurrency(result.requiredMonthlyPayment)} />
                <StatCard label="Payoff time" value={`${result.payoffMonths} months`} />
                <StatCard label="Total interest" value={formatCurrency(result.totalInterestPaid)} />
                <StatCard label="Total paid" value={formatCurrency(result.totalPaid)} />
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
                <Spinner size="sm" /> Calculating…
              </p>
            )}
            {result && (
              <p className="mt-2 text-xs text-text-muted">at {formatPercent(result.appliedAnnualInterestRatePercent)} APR</p>
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
            {request.method === 'Balloon' && (
              <p className="mt-3 text-xs text-text-muted">
                This ratio is based on the interest-only payment above — it doesn't reflect the full balloon payment due at maturity.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
