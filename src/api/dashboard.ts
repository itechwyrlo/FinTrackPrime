import { apiClient } from './client'
import type { DashboardViewModel } from '../types/api'

export const dashboardApi = {
  get: async (): Promise<DashboardViewModel> => {
    const { data } = await apiClient.get<DashboardViewModel>('/api/dashboard')
    return data
  },
}
