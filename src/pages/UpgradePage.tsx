import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Calculator, Check, FileText, LineChart, PiggyBank } from 'lucide-react'
import { checkoutApi } from '../api/checkout'
import { useAuth } from '../context/AuthContext'
import { usePayPalScript } from '../hooks/usePayPalScript'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

// Must match Premium:PriceUsd / Premium:Currency in the backend's
// appsettings.json — if that changes, this display value and the
// amount sent to PayPal both need to change with it. One flat price
// unlocks every tool below, permanently — there is nothing left to buy
// after this.
const PRICE = '15.00'
const CURRENCY = 'USD'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? ''

const TOOLS = [
  { name: 'Loan Calculator', icon: Calculator, blurb: 'Full amortization schedule, with extra-payment scenarios.', to: '/loan-calculator' },
  { name: 'Investment Portfolio Tracker', icon: LineChart, blurb: 'Track holdings, allocation, and gain or loss.', to: '/investment-tracker' },
  { name: 'Retirement Planner', icon: PiggyBank, blurb: 'A year-by-year projection to your retirement age.', to: '/retirement-planner' },
  { name: 'Financial Statement generator', icon: FileText, blurb: 'A live personal balance sheet and net worth.', to: '/financial-statement' },
]

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY }).format(Number(value))
}

export function UpgradePage() {
  const paypalStatus = usePayPalScript(PAYPAL_CLIENT_ID)
  const { login } = useAuth()
  const queryClient = useQueryClient()
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const { data: status } = useQuery({
    queryKey: ['premium-status'],
    queryFn: checkoutApi.getStatus,
  })

  const isUnlocked = status?.isUnlocked ?? false

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
        style: { color: 'gold', shape: 'rect', label: 'pay', height: 45 },
        createOrder: (_data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: PRICE, currency_code: CURRENCY } }],
          }),
        onApprove: async (data, actions) => {
          setError(null)
          setIsVerifying(true)
          try {
            // Capture first: the backend's status check only accepts
            // an order that's actually COMPLETED, not just approved.
            await actions.order.capture()
            const response = await checkoutApi.verify({ payPalOrderId: data.orderID })
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
      .render('#paypal-button-premium')
  }, [paypalStatus, isUnlocked, login, queryClient])

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-text-primary">Premium tools</h1>
      <p className="mt-2 text-sm text-text-secondary">
        {isUnlocked
          ? 'You have every premium tool unlocked.'
          : `One purchase, ${formatPrice(PRICE)}, unlocks all four tools below — for good.`}
      </p>

      {!isUnlocked && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="font-medium text-text-primary">Unlock all premium tools</p>
            <span className="tabular-figure text-lg font-semibold text-ft-gold-ink dark:text-ft-gold">{formatPrice(PRICE)}</span>
          </div>

          <ul className="mt-3 space-y-2">
            {TOOLS.map(({ name, icon: Icon, blurb }) => (
              <li key={name} className="flex items-start gap-2.5 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                <span>
                  <span className="font-medium text-text-primary">{name}</span>{' '}
                  <span className="text-text-secondary">— {blurb}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4">
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
            <div id="paypal-button-premium" ref={buttonContainerRef} className="[contain:layout]" />
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
      )}

      {isUnlocked && (
        <Card className="mt-6 border-status-good/30 bg-status-good/5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-text-primary">All premium tools</p>
            <Badge variant="good" icon={<Check className="h-3 w-3" />}>
              Unlocked
            </Badge>
          </div>
          {status?.purchasedAtUtc && (
            <p className="mt-1 text-xs text-text-muted">
              Unlocked on {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(status.purchasedAtUtc))}
            </p>
          )}

          <ul className="mt-4 space-y-1">
            {TOOLS.map(({ name, icon: Icon, to }) => (
              <li key={to}>
                <a
                  href={to}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-text-primary transition-colors hover:bg-white/5"
                >
                  <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
