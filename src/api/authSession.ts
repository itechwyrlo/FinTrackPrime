import type { AuthResponse } from '../types/api'

export type AuthSession = Pick<
  AuthResponse,
  'token' | 'accessTokenExpiresAtUtc' | 'fullName' | 'email' | 'unlockedTools'
>

type Listener = (session: AuthSession | null) => void

// The access token now lives only in memory (never localStorage): it's
// short-lived (15 min) and renewed via the ftp_refresh HttpOnly cookie,
// so persisting it client-side would just be a stale copy nobody reads
// safely. This module is the single source of truth both the axios
// client (attaching/refreshing it) and AuthContext (rendering it) share.
let session: AuthSession | null = null
const listeners = new Set<Listener>()

export const authSession = {
  get: () => session,
  set: (next: AuthResponse): AuthSession => {
    session = {
      token: next.token,
      accessTokenExpiresAtUtc: next.accessTokenExpiresAtUtc,
      fullName: next.fullName,
      email: next.email,
      unlockedTools: next.unlockedTools,
    }
    listeners.forEach((listener) => listener(session))
    return session
  },
  clear: () => {
    session = null
    listeners.forEach((listener) => listener(session))
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
