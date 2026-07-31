import { useEffect, useState } from 'react'

// PayPal attaches itself to window; there's no npm package for the
// Buttons SDK itself, so the script tag is the integration point.
// Minimal shape, just enough of the API this app actually calls.
declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: Record<string, unknown>
        createOrder: (data: unknown, actions: PayPalOrderActions) => Promise<string>
        onApprove: (data: { orderID: string }, actions: PayPalCaptureActions) => Promise<void>
        onError?: (err: unknown) => void
      }) => { render: (containerId: string) => void }
    }
  }
}

interface PayPalOrderActions {
  order: {
    create: (details: {
      purchase_units: { amount: { value: string; currency_code: string } }[]
    }) => Promise<string>
  }
}

interface PayPalCaptureActions {
  order: {
    // Must be called before the backend's status check will see
    // COMPLETED; approval alone isn't a completed order yet.
    capture: () => Promise<unknown>
  }
}

const SCRIPT_ID = 'paypal-sdk-script'

type PayPalScriptStatus = 'loading' | 'ready' | 'error'

export function usePayPalScript(clientId: string): PayPalScriptStatus {
  const [status, setStatus] = useState<PayPalScriptStatus>(() =>
    window.paypal ? 'ready' : 'loading',
  )

  useEffect(() => {
    if (window.paypal) {
      setStatus('ready')
      return
    }

    // A missing client id means the request would be malformed before
    // it even reaches PayPal, so this fails fast with a clear reason
    // instead of hanging on "loading" forever.
    if (!clientId) {
      setStatus('error')
      return
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => setStatus('ready'))
      existing.addEventListener('error', () => setStatus('error'))
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    // disable-funding=card: a second "Debit or Credit Card" button next to
    // "Pay with PayPal" pushes the widget into PayPal's narrow-container
    // fallback on mobile, which renders with a fixed position and an
    // extremely high z-index — enough to float above our own nav drawer.
    // Card payment is still available inside the PayPal button's own
    // hosted checkout, so this only drops the redundant second button.
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=card`
    script.async = true
    script.onload = () => setStatus('ready')
    // Fires when PayPal responds with an error status (bad/unknown
    // client id) or the request fails outright. Without this, a bad
    // client id left the screen stuck on "Loading payment options…"
    // with no indication anything had gone wrong.
    script.onerror = () => setStatus('error')
    document.body.appendChild(script)
  }, [clientId])

  return status
}