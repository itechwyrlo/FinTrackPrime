import { apiClient } from './client'
import type { CreateLiabilityRequest, FinancialStatementViewModel, LiabilityViewModel } from '../types/api'

export const financialStatementApi = {
  get: async (): Promise<FinancialStatementViewModel> => {
    const { data } = await apiClient.get<FinancialStatementViewModel>('/api/financial-statement')
    return data
  },
  addLiability: async (request: CreateLiabilityRequest): Promise<LiabilityViewModel> => {
    const { data } = await apiClient.post<LiabilityViewModel>(
      '/api/financial-statement/liabilities',
      request,
    )
    return data
  },
  removeLiability: async (liabilityId: string): Promise<void> => {
    await apiClient.delete(`/api/financial-statement/liabilities/${liabilityId}`)
  },
}
