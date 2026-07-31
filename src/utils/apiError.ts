import axios from 'axios'

// Two distinct error shapes come back from the auth endpoints: business
// failures (bad login, expired/reused refresh, invalid Google credential,
// duplicate email) are `{ message }`, while ASP.NET model validation
// failures are `ValidationProblemDetails` (`{ errors: { Field: [...] } }`).
interface BusinessErrorBody {
  message?: string
}

interface ValidationProblemDetails {
  errors?: Record<string, string[]>
}

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Try again.'): string {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data as (BusinessErrorBody & ValidationProblemDetails) | undefined
  if (!data) return fallback

  if (data.message) return data.message

  const firstFieldErrors = data.errors && Object.values(data.errors)[0]
  if (firstFieldErrors?.[0]) return firstFieldErrors[0]

  return fallback
}
