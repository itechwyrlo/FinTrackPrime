import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Frontend-side convenience only; the real gate is the backend's
// RequirePremium policy, shared by all four premium controllers. This
// just avoids showing a premium tool's page to someone who'd
// immediately get 403s from it — premium is one all-tools purchase, so
// there's nothing to pass in beyond "is this user unlocked at all."
export function PremiumRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user?.premiumUnlocked) {
    return <Navigate to="/upgrade" replace />
  }

  return <>{children}</>
}
