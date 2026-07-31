import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { loanCalculatorApi } from '../api/loanCalculator'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import type { LoanCalculationRequest } from '../types/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'
import { Spinner } from '../components/ui/Spinner'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const DEFAULT_REQUEST: LoanCalculationRequest = {
  principalAmount: 25000,
  annualInterestRatePercent: 6.5,
  termMonths: 60,
  extraMonthlyPayment: 0,
}

export function LoanCalculatorPage() {
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

  const updateField = (field: keyof LoanCalculationRequest, value: number) => {
    setRequest((prev) => ({ ...prev, [field]: value }))
  }

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
          <Input
            label="Loan amount"
            variant="currency"
            type="number"
            min={0}
            value={request.principalAmount}
            onChange={(e) => updateField('principalAmount', Number(e.target.value))}
          />
          <Input
            label="Annual interest rate"
            variant="percent"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={request.annualInterestRatePercent}
            onChange={(e) => updateField('annualInterestRatePercent', Number(e.target.value))}
          />
          <Input
            label="Term (months)"
            type="number"
            min={1}
            max={480}
            value={request.termMonths}
            onChange={(e) => updateField('termMonths', Number(e.target.value))}
          />
          <Input
            label="Extra monthly payment"
            variant="currency"
            type="number"
            min={0}
            value={request.extraMonthlyPayment}
            onChange={(e) => updateField('extraMonthlyPayment', Number(e.target.value))}
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
        </div>
      </div>
    </div>
  )
}
