import { useEffect, useRef, useState } from 'react'
import { useGoogleIdentityScript } from '../hooks/useGoogleIdentityScript'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
// GSI's renderButton only accepts a fixed pixel width (no 100%/auto), and
// clamps it to this range itself — matching the clamp here avoids measuring
// a width the button would silently ignore.
const MIN_WIDTH = 200
const MAX_WIDTH = 400

export function GoogleSignInButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void
  disabled?: boolean
}) {
  const status = useGoogleIdentityScript()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  // Ref, not a dependency: the callback closes over each render's state
  // (email/password/etc via the parent page), but re-running
  // initialize()/renderButton() on every keystroke would flicker the button.
  const onCredentialRef = useRef(onCredential)
  onCredentialRef.current = onCredential

  // Matches the button's width to its container (same as the Input/Button
  // fields above it) instead of GSI's hardcoded default, and keeps it in
  // sync if the layout's width changes (e.g. crossing a breakpoint).
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width))
    })
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (status !== 'ready' || !window.google || !containerRef.current || !GOOGLE_CLIENT_ID || !width) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onCredentialRef.current(response.credential),
    })

    // Cleared first: React's StrictMode double-invokes effects in
    // development, and renderButton() doesn't replace an existing button.
    containerRef.current.innerHTML = ''
    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      width: Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH),
    })
  }, [status, width])

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-xs text-status-critical">
        Google sign-in unavailable. Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env.local</code>.
      </p>
    )
  }

  if (status === 'error') {
    return <p className="text-xs text-status-critical">Couldn't load Google sign-in.</p>
  }

  return (
    <div ref={wrapperRef} className="w-full">
      <div
        ref={containerRef}
        aria-disabled={disabled}
        className={disabled ? 'pointer-events-none opacity-50' : undefined}
      />
    </div>
  )
}
