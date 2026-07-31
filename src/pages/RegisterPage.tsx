import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../utils/apiError'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { Button } from '../components/ui/Button'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.register({ fullName, email, password })
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
    <AuthLayout title="Create your account" subtitle="Get a dashboard and a starter budget in seconds.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="fullName"
          label="Full name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="At least 8 characters"
        />

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-status-critical">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2" isLoading={isSubmitting} disabled={isSubmitting}>
          Create account
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-4 flex justify-center">
        <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isSubmitting} />
      </div>

      <p className="mt-6 text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-ft-blue underline underline-offset-2">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
