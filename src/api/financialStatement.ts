import { apiClient } from './client'
import type {
  CreateAssetRequest,
  CreateLiabilityRequest,
  AssetLineViewModel,
  FinancialStatementViewModel,
  LiabilityViewModel,
} from '../types/api'

export const financialStatementApi = {
  get: async (): Promise<FinancialStatementViewModel> => {
    const { data } = await apiClient.get<FinancialStatementViewModel>('/api/financial-statement')
    return data
  },
  addAsset: async (request: CreateAssetRequest): Promise<AssetLineViewModel> => {
    const { data } = await apiClient.post<AssetLineViewModel>('/api/financial-statement/assets', request)
    return data
  },
  removeAsset: async (assetId: string): Promise<void> => {
    await apiClient.delete(`/api/financial-statement/assets/${assetId}`)
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
