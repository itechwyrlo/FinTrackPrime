import { useEffect, useState } from 'react'

// Google Identity Services attaches itself to window; there's no npm
// package needed for the button/One Tap flow, just this script tag.
// Minimal shape, just enough of the API this app actually calls.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon'
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              width?: number
            },
          ) => void
        }
      }
    }
  }
}

const SCRIPT_ID = 'google-identity-script'

type GoogleIdentityScriptStatus = 'loading' | 'ready' | 'error'

export function useGoogleIdentityScript(): GoogleIdentityScriptStatus {
  const [status, setStatus] = useState<GoogleIdentityScriptStatus>(() => (window.google ? 'ready' : 'loading'))

  useEffect(() => {
    if (window.google) {
      setStatus('ready')
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
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setStatus('ready')
    script.onerror = () => setStatus('error')
    document.body.appendChild(script)
  }, [])

  return status
}
