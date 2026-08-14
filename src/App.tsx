import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PremiumRoute } from './components/PremiumRoute'
import { AppLayout } from './components/AppLayout'
import { FullPageSpinner } from './components/FullPageSpinner'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { BankLinkCallbackPage } from './pages/BankLinkCallbackPage'
import { BudgetPlannerPage } from './pages/BudgetPlannerPage'
import { CashFlowPage } from './pages/CashFlowPage'
import { UpgradePage } from './pages/UpgradePage'
import { LoanCalculatorPage } from './pages/LoanCalculatorPage'
import { InvestmentTrackerPage } from './pages/InvestmentTrackerPage'
import { RetirementPlannerPage } from './pages/RetirementPlannerPage'
import { FinancialStatementPage } from './pages/FinancialStatementPage'
import { StyleGuidePage } from './pages/StyleGuidePage'

function RootRedirect() {
  const { isAuthenticated, isInitializing } = useAuth()
  if (isInitializing) {
    return <FullPageSpinner />
  }
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Dev-only Phase 1 verification route, not linked from any nav. Remove once pages consume the library directly (Phase 3). */}
      {import.meta.env.DEV && <Route path="/style-guide" element={<StyleGuidePage />} />}

      <Route element={<ProtectedRoute />}>
        {/* Outside AppLayout on purpose: this is a brief transitional
            screen reached only via Finverse's redirect, not a page a
            user navigates to from the sidebar. */}
        <Route path="/bank-link/callback" element={<BankLinkCallbackPage />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/budget-planner" element={<BudgetPlannerPage />} />
          <Route path="/cash-flow" element={<CashFlowPage />} />
          <Route path="/upgrade" element={<UpgradePage />} />

          <Route
            path="/loan-calculator"
            element={
              <PremiumRoute>
                <LoanCalculatorPage />
              </PremiumRoute>
            }
          />
          <Route
            path="/investment-tracker"
            element={
              <PremiumRoute>
                <InvestmentTrackerPage />
              </PremiumRoute>
            }
          />
          <Route
            path="/retirement-planner"
            element={
              <PremiumRoute>
                <RetirementPlannerPage />
              </PremiumRoute>
            }
          />
          <Route
            path="/financial-statement"
            element={
              <PremiumRoute>
                <FinancialStatementPage />
              </PremiumRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App