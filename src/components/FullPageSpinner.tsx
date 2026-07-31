import { Spinner } from './ui/Spinner'

/** Shown while the startup session refresh is in flight, before we know if the user is logged in. */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <Spinner size="lg" className="text-ft-blue" />
    </div>
  )
}
