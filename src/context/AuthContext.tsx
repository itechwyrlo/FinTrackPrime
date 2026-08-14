import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { authSession, type AuthSession } from '../api/authSession'
import type { AuthResponse } from '../types/api'

interface AuthUser {
  fullName: string
  email: string
  premiumUnlocked: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  // True until the startup /refresh call (see below) has settled, so
  // route guards can wait instead of bouncing a still-logged-in user to
  // /login just because the in-memory token hasn't been re-established yet.
  isInitializing: boolean
  login: (response: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toUser(session: AuthSession | null): AuthUser | null {
  if (!session) return null
  return { fullName: session.fullName, email: session.email, premiumUnlocked: session.premiumUnlocked }
}

// Renew this long before actual expiry so a request in flight never
// straddles the boundary and gets a spurious 401.
const REFRESH_MARGIN_MS = 60_000

// Routes reachable without a session, where there's no "already logged
// in — redirect them elsewhere" decision to make, so the startup probe
// below is skipped for these specifically. Every other route still needs
// the answer before ProtectedRoute/RootRedirect can decide whether to
// render or redirect.
const GUEST_ONLY_ROUTES = ['/login', '/register']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authSession.get())
  const [isInitializing, setIsInitializing] = useState(true)

  // The response interceptor's reactive refresh (triggered by a 401 on
  // some unrelated API call) writes straight to the authSession store
  // rather than through `login()` below — this is what keeps this
  // context's user/token in sync with that.
  useEffect(() => authSession.subscribe(setSession), [])

  // The access token lives only in memory, so a fresh page load starts
  // with none. Silently trade the ftp_refresh cookie (if any) for a new
  // access token before deciding whether the user is logged in — except
  // on a guest-only route, where nothing needs that answer yet.
  //
  // window.location.pathname (not useLocation) is deliberate: this only
  // needs to check where the app *booted*, not react to later in-app
  // navigation, so the effect keeps its original run-once-on-mount `[]`
  // dependency array instead of re-firing a refresh call on every route
  // change.
  useEffect(() => {
    if (GUEST_ONLY_ROUTES.includes(window.location.pathname)) {
      setIsInitializing(false)
      return
    }

    let cancelled = false
    authApi
      .refresh()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Proactive renewal: reschedules whenever a new token arrives, from
  // any source (login, register, google, refresh, or a premium purchase
  // verify, all of which funnel through `login()` or the interceptor).
  useEffect(() => {
    if (!session) return

    const expiresAt = new Date(session.accessTokenExpiresAtUtc).getTime()
    const delay = Math.max(expiresAt - Date.now() - REFRESH_MARGIN_MS, 0)

    const timer = window.setTimeout(() => {
      authApi.refresh().catch(() => {})
    }, delay)

    return () => window.clearTimeout(timer)
  }, [session?.accessTokenExpiresAtUtc])

  // Login, register, google, and premium verify all return the same
  // AuthResponse shape (including whether premium is unlocked), so all
  // four funnel through this one function.
  const login = (response: AuthResponse) => {
    authSession.set(response)
  }

  const logout = () => {
    // Best-effort: client-side state clears either way, so a network
    // failure here shouldn't leave the user stuck looking logged in.
    authApi.logout().catch(() => {})
    authSession.clear()
  }

  const user = toUser(session)

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
