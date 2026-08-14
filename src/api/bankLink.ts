import { apiClient } from './client'
import type { CompleteLinkRequest, DashboardViewModel, StartLinkResponse } from '../types/api'

export const bankLinkApi = {
  startLink: async (): Promise<StartLinkResponse> => {
    const { data } = await apiClient.post<StartLinkResponse>('/api/bank-link/token')
    return data
  },
  completeLink: async (request: CompleteLinkRequest): Promise<DashboardViewModel> => {
    const { data } = await apiClient.post<DashboardViewModel>('/api/bank-link/complete', request)
    return data
  },
  sync: async (): Promise<DashboardViewModel> => {
    const { data } = await apiClient.post<DashboardViewModel>('/api/bank-link/sync')
    return data
  },
  disconnectAll: async (): Promise<void> => {
    await apiClient.delete('/api/bank-link')
  },
}
