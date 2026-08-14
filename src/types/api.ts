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

export interface AuthResponse {
  token: string
  accessTokenExpiresAtUtc: string
  fullName: string
  email: string
  premiumUnlocked: boolean
}

// 'Transfer' = money moving between the user's own accounts (a credit
// card payment, a bank transfer) rather than real income or spending —
// excluded from Cash Flow's Income/Expense totals on the backend, but
// still shows up in an account's recentTransactions.
export type TransactionDirection = 'Income' | 'Expense' | 'Transfer'

// 'Unsupported' = Finverse returned this account but with a subtype the
// backend doesn't know how to interpret (Bitcoin/FX wallets seen so
// far). Balance/nickname are real; it has no transactions and its
// balance isn't in Cash Flow or the Financial Statement's totals.
export type AccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Other' | 'Crypto' | 'Unsupported'

export interface TransactionViewModel {
  id: string
  description: string
  category: string
  amount: number
  direction: TransactionDirection
  occurredAtUtc: string
}

export interface AccountViewModel {
  id: string
  nickname: string
  type: AccountType
  balance: number
  // Was missing — balance isn't always the same unit across accounts
  // (HKD vs SGD vs, for an Unsupported account, BTC/USD).
  currency: string
  recentTransactions: TransactionViewModel[]
}

export interface DashboardViewModel {
  accounts: AccountViewModel[]
}

// Real bank accounts are linked via Finverse, not entered by hand — see
// api/bankLink.ts. StartLinkResponse.linkUrl is where the browser
// navigates to run Finverse's hosted Link UI; CompleteLinkRequest.linkCode
// is the code Finverse's redirect hands back to /bank-link/callback.
export interface StartLinkResponse {
  linkUrl: string
}

export interface CompleteLinkRequest {
  linkCode: string
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

// Same shape as CashFlowViewModel's top-level fields, scoped to one
// currency. The backend does no FX conversion, so a user with accounts
// in more than one currency gets one of these per non-primary currency
// in otherCurrencies instead of everything blended into one number.
export interface CashFlowByCurrencyViewModel {
  currency: string
  totalIncome: number
  totalExpenses: number
  net: number
  expenseByCategory: CategoryAmountViewModel[]
  monthlyTrend: MonthlyCashFlowViewModel[]
}

export interface CashFlowViewModel {
  // Currency of totalIncome/totalExpenses/net/expenseByCategory/monthlyTrend
  // below — whichever currency has the most transactions. Any other
  // currencies the user holds are in otherCurrencies, not blended in here.
  currency: string
  totalIncome: number
  totalExpenses: number
  net: number
  expenseByCategory: CategoryAmountViewModel[]
  monthlyTrend: MonthlyCashFlowViewModel[]
  otherCurrencies: CashFlowByCurrencyViewModel[]
}

export interface PremiumStatusViewModel {
  isUnlocked: boolean
  purchasedAtUtc?: string
}

export interface VerifyPurchaseRequest {
  payPalOrderId: string
}

export type AmortizationMethod = 'Equal' | 'FixedPrincipal' | 'GracePeriod' | 'Balloon'

export interface LoanRateViewModel {
  type: LiabilityType
  annualRatePercent: number
}

// annualInterestRatePercent does not exist here — loanType drives which
// bank rate the server applies; the client can't supply or influence it.
export interface LoanCalculationRequest {
  principalAmount: number
  loanType: LiabilityType
  termMonths: number
  extraMonthlyPayment: number
  method: AmortizationMethod
  // Required only when method === 'GracePeriod'.
  gracePeriodMonths?: number
}

export interface AmortizationRowViewModel {
  month: number
  paymentAmount: number
  principalPaid: number
  interestPaid: number
  remainingBalance: number
}

export interface LoanCalculationResultViewModel {
  // First period's payment for every method except 'Equal', where it's
  // constant across the whole schedule.
  requiredMonthlyPayment: number
  payoffMonths: number
  totalInterestPaid: number
  totalPaid: number
  appliedAnnualInterestRatePercent: number
  schedule: AmortizationRowViewModel[]
}

export interface LoanAffordabilityRequest {
  principalAmount: number
  loanType: LiabilityType
  termMonths: number
  method: AmortizationMethod
  gracePeriodMonths?: number
}

export type AffordabilityRating = 'Unknown' | 'Comfortable' | 'Manageable' | 'Stretched' | 'NotRecommended'

export interface LoanAffordabilityResultViewModel {
  proposedMonthlyPayment: number
  monthlyIncome: number
  existingMonthlyObligations: number
  totalExistingLiabilities: number
  currentDebtToIncomeRatioPercent: number | null
  projectedDebtToIncomeRatioPercent: number | null
  rating: AffordabilityRating
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

// Cash and Investment (assets) / CreditCard (liabilities) are
// system-assigned — they only ever come from synced accounts/holdings
// and are never offered as a choice in the "Add an asset"/"Add a
// liability" forms. See MANUAL_ASSET_TYPE_OPTIONS /
// MANUAL_LIABILITY_TYPE_OPTIONS in FinancialStatementPage.tsx.
export type AssetType = 'Cash' | 'Investment' | 'RealEstate' | 'Vehicle' | 'Crypto' | 'Other'
export type LiabilityType = 'CreditCard' | 'Mortgage' | 'AutoLoan' | 'StudentLoan' | 'PersonalLoan' | 'Other'

export interface LiabilityViewModel {
  id: string
  name: string
  type: LiabilityType
  currency: string
  amount: number
}

export interface CreateLiabilityRequest {
  name: string
  type: LiabilityType
  amount: number
}

export interface AssetLineViewModel {
  // Undefined for synced lines (Cash from an account, Investment from a
  // holding) — those aren't removable. Set for manual assets, which are.
  id?: string
  label: string
  type: AssetType
  currency: string
  amount: number
}

export interface CreateAssetRequest {
  name: string
  type: AssetType
  amount: number
}

// One currency's worth of the statement, mirroring
// CashFlowByCurrencyViewModel — never summed together with any other
// currency's bucket.
export interface FinancialStatementByCurrencyViewModel {
  currency: string
  assets: AssetLineViewModel[]
  totalAssets: number
  liabilities: LiabilityViewModel[]
  totalLiabilities: number
  ownersEquity: number
}

// currency/assets/totalAssets/liabilities/totalLiabilities/ownersEquity
// below are whichever currency has the most combined asset+liability
// lines; every other currency present is in otherCurrencies.
export interface FinancialStatementViewModel {
  currency: string
  assets: AssetLineViewModel[]
  totalAssets: number
  liabilities: LiabilityViewModel[]
  totalLiabilities: number
  ownersEquity: number
  generatedAtUtc: string
  otherCurrencies: FinancialStatementByCurrencyViewModel[]
}

// More values (BankConnected, BankDisconnected, NewDeviceSignIn, ...)
// arrive with the security-events follow-on feature.
export type NotificationType = 'UnusualSpend'

export interface NotificationViewModel {
  id: string
  type: NotificationType
  title: string
  message: string
  relatedTransactionId?: string
  isRead: boolean
  createdAtUtc: string
}

export interface NotificationListViewModel {
  items: NotificationViewModel[]
  unreadCount: number
  hasMore: boolean
}