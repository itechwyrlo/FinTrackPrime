import { apiClient } from './client'
import type {
  BudgetCategoryViewModel,
  BudgetPlannerViewModel,
  CreateBudgetCategoryRequest,
  UpdateBudgetCategoryRequest,
} from '../types/api'

export const budgetPlannerApi = {
  get: async (): Promise<BudgetPlannerViewModel> => {
    const { data } = await apiClient.get<BudgetPlannerViewModel>('/api/budget-planner')
    return data
  },
  addCategory: async (request: CreateBudgetCategoryRequest): Promise<BudgetCategoryViewModel> => {
    const { data } = await apiClient.post<BudgetCategoryViewModel>('/api/budget-planner', request)
    return data
  },
  updateCategory: async (
    categoryId: string,
    request: UpdateBudgetCategoryRequest,
  ): Promise<BudgetCategoryViewModel> => {
    const { data } = await apiClient.put<BudgetCategoryViewModel>(
      `/api/budget-planner/${categoryId}`,
      request,
    )
    return data
  },
  removeCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/api/budget-planner/${categoryId}`)
  },
}
