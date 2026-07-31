import { useEffect, useRef } from 'react'
import { useGoogleIdentityScript } from '../hooks/useGoogleIdentityScript'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export function GoogleSignInButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void
  disabled?: boolean
}) {
  const status = useGoogleIdentityScript()
  const containerRef = useRef<HTMLDivElement>(null)

  // Ref, not a dependency: the callback closes over each render's state
  // (email/password/etc via the parent page), but re-running
  // initialize()/renderButton() on every keystroke would flicker the button.
  const onCredentialRef = useRef(onCredential)
  onCredentialRef.current = onCredential

  useEffect(() => {
    if (status !== 'ready' || !window.google || !containerRef.current || !GOOGLE_CLIENT_ID) {
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
      width: 320,
    })
  }, [status])

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
    <div
      ref={containerRef}
      aria-disabled={disabled}
      className={disabled ? 'pointer-events-none opacity-50' : undefined}
    />
  )
}
