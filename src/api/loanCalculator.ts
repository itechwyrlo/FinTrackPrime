import { apiClient } from './client'
import type { LoanCalculationRequest, LoanCalculationResultViewModel } from '../types/api'

export const loanCalculatorApi = {
  calculate: async (request: LoanCalculationRequest): Promise<LoanCalculationResultViewModel> => {
    const { data } = await apiClient.post<LoanCalculationResultViewModel>(
      '/api/loan-calculator/calculate',
      request,
    )
    return data
  },
}
