import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { bankLinkApi } from '../api/bankLink'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

/**
 * Where Finverse's Link UI redirects the browser back to after the user
 * picks an institution and authenticates — registered as the Finverse
 * Callback URL. Reads the authorization code out of the query string,
 * exchanges it via the backend, then sends the user on to the dashboard.
 * Never rendered by a link from within the app itself.
 */
export function BankLinkCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const hasStarted = useRef(false)
  const [failure, setFailure] = useState<string | null>(null)

  const code = searchParams.get('code')
  // Finverse's Link UI reports a declined/abandoned session with an
  // `error` query param instead of a code, same shape as a standard
  // OAuth authorization-code redirect.
  const linkError = searchParams.get('error')

  const mutation = useMutation({
    mutationFn: (linkCode: string) => bankLinkApi.completeLink({ linkCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/dashboard', { replace: true })
    },
    onError: () => setFailure("We couldn't finish connecting your bank. Nothing was saved — you can try again."),
  })

  useEffect(() => {
    if (hasStarted.current) return
    if (linkError) {
      setFailure('Bank connection was cancelled.')
      return
    }
    if (!code) {
      setFailure("This page expects to be reached from your bank's connection flow.")
      return
    }
    hasStarted.current = true
    mutation.mutate(code)
    // mutation is a new object identity every render; only code/linkError
    // should ever re-trigger this, and hasStarted already guards re-entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, linkError])

  if (failure) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <AlertTriangle className="h-8 w-8 text-status-critical" />
        <p className="max-w-sm text-sm text-text-secondary">{failure}</p>
        <Button onClick={() => navigate('/dashboard', { replace: true })}>Back to dashboard</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface">
      <Spinner size="lg" className="text-ft-blue" />
      <p className="text-sm text-text-secondary">Finishing connecting your bank…</p>
    </div>
  )
}
