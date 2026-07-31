import { apiClient } from './client'
import type { AuthResponse, PremiumStatusViewModel, VerifyPurchaseRequest } from '../types/api'

export const checkoutApi = {
  getStatus: async (): Promise<PremiumStatusViewModel> => {
    const { data } = await apiClient.get<PremiumStatusViewModel>('/api/checkout/status')
    return data
  },
  verify: async (request: VerifyPurchaseRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/checkout/verify', request)
    return data
  },
}
