import axios, { type InternalAxiosRequestConfig } from 'axios'
import { authSession, type AuthSession } from './authSession'
import type { AuthResponse } from '../types/api'

// Vite exposes env vars prefixed VITE_ on import.meta.env. Set
// VITE_API_BASE_URL in .env.local for dev and in Vercel's project
// settings for the deployed frontend, pointing at the MonsterASP.NET
// backend URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // The refresh token only exists as the HttpOnly ftp_refresh cookie
  // (scoped to /api/auth) — without credentials included, it never
  // round-trips and /refresh has nothing to read.
  withCredentials: true,
})

// Every request that has a token attaches it. Requests made before
// login (register, login itself) simply have no token to attach yet.
apiClient.interceptors.request.use((config) => {
  const token = authSession.get()?.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// A single place to react to auth failures, instead of every screen
// checking status codes itself.
export const AUTH_EXPIRED_EVENT = 'fintrack-prime-auth-expired'
export const PREMIUM_REQUIRED_EVENT = 'fintrack-prime-premium-required'

// /refresh and /logout must never trigger the reactive-refresh-and-retry
// dance below — refresh failing means the session is over, not "try
// refreshing again", and logout's own 401/204 isn't a token problem.
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/google', '/api/auth/refresh', '/api/auth/logout']

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_ENDPOINTS.some((path) => url.includes(path))
}

// Concurrent 401s (e.g. a page firing several requests at once) share a
// single in-flight /refresh call instead of each racing their own.
let refreshPromise: Promise<AuthSession> | null = null

export function refreshAccessToken(): Promise<AuthSession> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<AuthResponse>('/api/auth/refresh')
      .then(({ data }) => authSession.set(data))
      .catch((error) => {
        authSession.clear()
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config as RetryableRequestConfig | undefined

    // A 401 on any endpoint other than the auth ones itself means the
    // access token expired mid-session: refresh once and replay the
    // original request. If refresh also fails, the session is truly
    // over — refreshAccessToken() already cleared it, so just reject.
    if (status === 401 && originalRequest && !isAuthEndpoint(originalRequest.url) && !originalRequest._retried) {
      originalRequest._retried = true
      try {
        const session = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${session.token}`
        return apiClient(originalRequest)
      } catch {
        return Promise.reject(error)
      }
    }

    if (status === 403) {
      window.dispatchEvent(new Event(PREMIUM_REQUIRED_EVENT))
    }

    return Promise.reject(error)
  },
)
