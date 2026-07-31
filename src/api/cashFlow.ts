import { apiClient } from './client'
import type { CashFlowViewModel } from '../types/api'

export const cashFlowApi = {
  get: async (): Promise<CashFlowViewModel> => {
    const { data } = await apiClient.get<CashFlowViewModel>('/api/cash-flow')
    return data
  },
}
