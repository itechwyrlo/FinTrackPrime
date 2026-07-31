import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { authSession, type AuthSession } from '../api/authSession'
import type { AuthResponse, PremiumTool } from '../types/api'

interface AuthUser {
  fullName: string
  email: string
  unlockedTools: PremiumTool[]
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
  return { fullName: session.fullName, email: session.email, unlockedTools: session.unlockedTools }
}

// Renew this long before actual expiry so a request in flight never
// straddles the boundary and gets a spurious 401.
const REFRESH_MARGIN_MS = 60_000

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
  // access token before deciding whether the user is logged in.
  useEffect(() => {
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
  // AuthResponse shape, so all four funnel through this one function.
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
