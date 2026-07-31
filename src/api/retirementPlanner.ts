import { apiClient } from './client'
import type { RetirementPlanInputRequest, RetirementPlanViewModel } from '../types/api'

export const retirementPlannerApi = {
  get: async (): Promise<RetirementPlanViewModel> => {
    const { data } = await apiClient.get<RetirementPlanViewModel>('/api/retirement-planner')
    return data
  },
  save: async (request: RetirementPlanInputRequest): Promise<RetirementPlanViewModel> => {
    const { data } = await apiClient.put<RetirementPlanViewModel>('/api/retirement-planner', request)
    return data
  },
}
