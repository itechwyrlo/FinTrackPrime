// Mirrors FinTrackPrime.Models.ViewModels on the backend. Keeping the
// field names identical avoids a translation layer between what the
// API returns and what the frontend types expect.

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export type PremiumTool = 'LoanCalculator' | 'InvestmentTracker' | 'RetirementPlanner' | 'FinancialStatement'

export interface AuthResponse {
  token: string
  accessTokenExpiresAtUtc: string
  fullName: string
  email: string
  unlockedTools: PremiumTool[]
}

export type TransactionDirection = 'Income' | 'Expense'
export type AccountType = 'Checking' | 'Savings'

export interface TransactionViewModel {
  id: string
  description: string
  category: string
  amount: number
  direction: TransactionDirection
  occurredAtUtc: string
  isFlaggedUnusual: boolean
}

export interface AccountViewModel {
  id: string
  nickname: string
  type: AccountType
  balance: number
  recentTransactions: TransactionViewModel[]
}

export interface DashboardViewModel {
  accounts: AccountViewModel[]
}

export interface CreateAccountRequest {
  nickname: string
  type: AccountType
  startingBalance: number
}

export interface CreateTransactionRequest {
  description: string
  category: string
  amount: number
  direction: TransactionDirection
}

export type BudgetCategoryType = 'Income' | 'Expense'

export interface BudgetCategoryViewModel {
  id: string
  name: string
  type: BudgetCategoryType
  plannedAmount: number
}

export interface CreateBudgetCategoryRequest {
  name: string
  type: BudgetCategoryType
}

export interface UpdateBudgetCategoryRequest {
  name: string
  plannedAmount: number
}

export interface BudgetPlannerViewModel {
  categories: BudgetCategoryViewModel[]
  totalPlannedIncome: number
  totalPlannedExpenses: number
  plannedNet: number
}

export interface CategoryAmountViewModel {
  category: string
  amount: number
}

export interface MonthlyCashFlowViewModel {
  year: number
  month: number
  income: number
  expenses: number
}

export interface CashFlowViewModel {
  totalIncome: number
  totalExpenses: number
  net: number
  expenseByCategory: CategoryAmountViewModel[]
  monthlyTrend: MonthlyCashFlowViewModel[]
}

export interface UnlockedToolViewModel {
  tool: PremiumTool
  purchasedAtUtc: string
}

export interface PremiumStatusViewModel {
  unlockedTools: UnlockedToolViewModel[]
}

export interface VerifyPurchaseRequest {
  payPalOrderId: string
  tool: PremiumTool
}

export interface LoanCalculationRequest {
  principalAmount: number
  annualInterestRatePercent: number
  termMonths: number
  extraMonthlyPayment: number
}

export interface AmortizationRowViewModel {
  month: number
  paymentAmount: number
  principalPaid: number
  interestPaid: number
  remainingBalance: number
}

export interface LoanCalculationResultViewModel {
  requiredMonthlyPayment: number
  payoffMonths: number
  totalInterestPaid: number
  totalPaid: number
  schedule: AmortizationRowViewModel[]
}

export interface InvestmentHoldingViewModel {
  id: string
  symbol: string
  name: string
  shares: number
  costBasisPerShare: number
  currentPricePerShare: number
  currentValue: number
  gainLoss: number
  allocationPercent: number
}

export interface CreateInvestmentHoldingRequest {
  symbol: string
  name: string
  shares: number
  costBasisPerShare: number
  currentPricePerShare: number
}

export interface UpdateInvestmentHoldingRequest {
  shares: number
  costBasisPerShare: number
  currentPricePerShare: number
}

export interface InvestmentPortfolioViewModel {
  holdings: InvestmentHoldingViewModel[]
  totalCostBasis: number
  totalCurrentValue: number
  totalGainLoss: number
}

export interface RetirementPlanInputRequest {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyContribution: number
  annualReturnRatePercent: number
}

export interface RetirementProjectionPointViewModel {
  age: number
  projectedBalance: number
}

export interface RetirementPlanViewModel {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyContribution: number
  annualReturnRatePercent: number
  projectedBalanceAtRetirement: number
  projection: RetirementProjectionPointViewModel[]
}

export interface LiabilityViewModel {
  id: string
  name: string
  amount: number
}

export interface CreateLiabilityRequest {
  name: string
  amount: number
}

export interface AssetLineViewModel {
  label: string
  amount: number
}

export interface FinancialStatementViewModel {
  assets: AssetLineViewModel[]
  totalAssets: number
  liabilities: LiabilityViewModel[]
  totalLiabilities: number
  netWorth: number
  generatedAtUtc: string
}