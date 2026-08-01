import { apiClient } from './client'
import type {
  LoanAffordabilityRequest,
  LoanAffordabilityResultViewModel,
  LoanCalculationRequest,
  LoanCalculationResultViewModel,
} from '../types/api'

export const loanCalculatorApi = {
  calculate: async (request: LoanCalculationRequest): Promise<LoanCalculationResultViewModel> => {
    const { data } = await apiClient.post<LoanCalculationResultViewModel>(
      '/api/loan-calculator/calculate',
      request,
    )
    return data
  },
  checkAffordability: async (
    request: LoanAffordabilityRequest,
  ): Promise<LoanAffordabilityResultViewModel> => {
    const { data } = await apiClient.post<LoanAffordabilityResultViewModel>(
      '/api/loan-calculator/affordability',
      request,
    )
    return data
  },
}
