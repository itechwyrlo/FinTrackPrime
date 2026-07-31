import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Check } from 'lucide-react'
import { checkoutApi } from '../api/checkout'
import { useAuth } from '../context/AuthContext'
import { usePayPalScript } from '../hooks/usePayPalScript'
import type { PremiumTool } from '../types/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

// Flat price per tool. Must match Premium:PriceUsd / Premium:Currency
// in the backend's appsettings.json — if that changes, this display
// value and the amount sent to PayPal both need to change with it.
const TOOL_PRICE = '15.00'
const CURRENCY = 'USD'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? ''

const TOOLS: { tool: PremiumTool; name: string; blurb: string }[] = [
  { tool: 'LoanCalculator', name: 'Loan Calculator', blurb: 'Full amortization schedule, with extra-payment scenarios.' },
  { tool: 'InvestmentTracker', name: 'Investment Portfolio Tracker', blurb: 'Track holdings, allocation, and gain or loss.' },
  { tool: 'RetirementPlanner', name: 'Retirement Planner', blurb: 'A year-by-year projection to your retirement age.' },
  { tool: 'FinancialStatement', name: 'Financial Statement generator', blurb: 'A live personal balance sheet and net worth.' },
]

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY }).format(Number(value))
}

function ToolUnlockCard({
  tool,
  name,
  blurb,
  isUnlocked,
  purchasedAtUtc,
  paypalStatus,
}: {
  tool: PremiumTool
  name: string
  blurb: string
  isUnlocked: boolean
  purchasedAtUtc: string | undefined
  paypalStatus: 'loading' | 'ready' | 'error'
}) {
  const { login } = useAuth()
  const queryClient = useQueryClient()
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (paypalStatus !== 'ready' || isUnlocked || !window.paypal || !buttonContainerRef.current) {
      return
    }

    // Container cleared first: React's StrictMode double-invokes
    // effects in development, and PayPal's render() doesn't replace an
    // existing button on its own.
    buttonContainerRef.current.innerHTML = ''

    window.paypal
      .Buttons({
        style: { color: 'gold', shape: 'rect', label: 'pay', height: 40 },
        createOrder: (_data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: TOOL_PRICE, currency_code: CURRENCY } }],
          }),
        onApprove: async (data, actions) => {
          setError(null)
          setIsVerifying(true)
          try {
            // Capture first: the backend's status check only accepts
            // an order that's actually COMPLETED, not just approved.
            await actions.order.capture()
            const response = await checkoutApi.verify({ payPalOrderId: data.orderID, tool })
            login(response)
            queryClient.invalidateQueries({ queryKey: ['premium-status'] })
          } catch {
            setError(
              "Payment went through with PayPal, but we couldn't confirm it here. Contact support before trying again.",
            )
          } finally {
            setIsVerifying(false)
          }
        },
        onError: () => setError('Something went wrong with PayPal. Please try again.'),
      })
      .render(`#paypal-button-${tool}`)
  }, [paypalStatus, isUnlocked, tool, login, queryClient])

  if (isUnlocked) {
    return (
      <Card className="border-status-good/30 bg-status-good/5">
        <div className="flex items-center justify-between">
          <p className="font-medium text-text-primary">{name}</p>
          <Badge variant="good" icon={<Check className="h-3 w-3" />}>
            Unlocked
          </Badge>
        </div>
        <p className="text-sm text-text-secondary">{blurb}</p>
        {purchasedAtUtc && (
          <p className="mt-1 text-xs text-text-muted">
            Unlocked on {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(purchasedAtUtc))}
          </p>
        )}
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-medium text-text-primary">{name}</p>
        <span className="tabular-figure text-sm font-semibold text-ft-gold-ink dark:text-ft-gold">{formatPrice(TOOL_PRICE)}</span>
      </div>
      <p className="text-sm text-text-secondary">{blurb}</p>

      <div className="mt-3">
        {isVerifying && (
          <p className="mb-2 flex items-center gap-1.5 text-xs text-text-secondary">
            <Spinner size="sm" /> Confirming your payment…
          </p>
        )}
        {error && (
          <p className="mb-2 flex items-center gap-1.5 text-xs text-status-critical">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        )}
        {/* PayPal's SDK renders the button using `position: fixed`, positioned
            off its containing block. CSS `contain: layout` on this wrapper
            forces that containing block to be here instead of the viewport,
            so the button stays inside the card instead of floating above
            everything else on the page (e.g. the mobile nav drawer). */}
        <div id={`paypal-button-${tool}`} ref={buttonContainerRef} className="[contain:layout]" />
        {paypalStatus === 'loading' && (
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <Spinner size="sm" /> Loading payment options…
          </p>
        )}
        {paypalStatus === 'error' && (
          <p className="text-xs text-status-critical">
            Couldn't load PayPal. Check <code>VITE_PAYPAL_CLIENT_ID</code> in <code>.env.local</code>.
          </p>
        )}
      </div>
    </Card>
  )
}

export function UpgradePage() {
  const paypalStatus = usePayPalScript(PAYPAL_CLIENT_ID)
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: status } = useQuery({
    queryKey: ['premium-status'],
    queryFn: checkoutApi.getStatus,
  })

  const unlockedMap = new Map(status?.unlockedTools.map((u) => [u.tool, u.purchasedAtUtc]) ?? [])
  const allUnlocked = TOOLS.every((t) => unlockedMap.has(t.tool))

  // A locked nav link redirects here with ?tool=X, since clicking one
  // specific tool means "let me unlock this one," not "show me the
  // whole catalog." No param (the sidebar's "Unlock Premium" link, or
  // browsing here directly) still shows all four.
  const focusedTool = searchParams.get('tool') as PremiumTool | null
  const visibleTools = focusedTool ? TOOLS.filter((t) => t.tool === focusedTool) : TOOLS

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-text-primary">
        {focusedTool ? (visibleTools[0]?.name ?? 'Premium tools') : 'Premium tools'}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        {focusedTool
          ? `Unlock this one tool for ${formatPrice(TOOL_PRICE)}.`
          : allUnlocked
            ? 'You have every premium tool unlocked.'
            : `Unlock each tool on its own, ${formatPrice(TOOL_PRICE)} each, whenever you need it.`}
      </p>
      {focusedTool && (
        <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={() => setSearchParams({})}>
          Show all premium tools
        </Button>
      )}

      <div className="mt-6 space-y-4">
        {visibleTools.map(({ tool, name, blurb }) => (
          <ToolUnlockCard
            key={tool}
            tool={tool}
            name={name}
            blurb={blurb}
            isUnlocked={unlockedMap.has(tool)}
            purchasedAtUtc={unlockedMap.get(tool)}
            paypalStatus={paypalStatus}
          />
        ))}
      </div>
    </div>
  )
}
