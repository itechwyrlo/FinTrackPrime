import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { PremiumTool } from '../types/api'

// Frontend-side convenience only; the real gate is the backend's
// RequireLoanCalculator / RequireInvestmentTracker / etc. policies,
// one per tool. This just avoids showing a premium screen to someone
// who'd immediately get 403s from it. Takes a specific tool, since
// owning one tool says nothing about owning the others.
export function PremiumRoute({ tool, children }: { tool: PremiumTool; children: ReactNode }) {
  const { user } = useAuth()

  if (!user?.unlockedTools?.includes(tool)) {
  return <Navigate to={`/upgrade?tool=${tool}`} replace />
}

  return <>{children}</>
}