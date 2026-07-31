import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../utils/apiError'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { AlertTriangle } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await authApi.login({ email, password })
      login(response)
      navigate('/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleCredential = async (idToken: string) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await authApi.google({ idToken })
      login(response)
      navigate('/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your FinTrack Prime account.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-status-critical">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2" isLoading={isSubmitting} disabled={isSubmitting}>
          Log in
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-4">
        <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isSubmitting} />
      </div>

      <p className="mt-6 text-sm text-text-secondary">
        New to FinTrack Prime?{' '}
        <Link to="/register" className="font-medium text-ft-blue underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
