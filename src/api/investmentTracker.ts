import { apiClient } from './client'
import type {
  CreateInvestmentHoldingRequest,
  InvestmentHoldingViewModel,
  InvestmentPortfolioViewModel,
  UpdateInvestmentHoldingRequest,
} from '../types/api'

export const investmentTrackerApi = {
  get: async (): Promise<InvestmentPortfolioViewModel> => {
    const { data } = await apiClient.get<InvestmentPortfolioViewModel>('/api/investment-tracker')
    return data
  },
  addHolding: async (request: CreateInvestmentHoldingRequest): Promise<InvestmentHoldingViewModel> => {
    const { data } = await apiClient.post<InvestmentHoldingViewModel>('/api/investment-tracker', request)
    return data
  },
  updateHolding: async (
    holdingId: string,
    request: UpdateInvestmentHoldingRequest,
  ): Promise<InvestmentHoldingViewModel> => {
    const { data } = await apiClient.put<InvestmentHoldingViewModel>(
      `/api/investment-tracker/${holdingId}`,
      request,
    )
    return data
  },
  removeHolding: async (holdingId: string): Promise<void> => {
    await apiClient.delete(`/api/investment-tracker/${holdingId}`)
  },
}
