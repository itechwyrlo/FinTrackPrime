import { apiClient } from './client'
import type { AccountViewModel, CreateAccountRequest, CreateTransactionRequest, TransactionViewModel } from '../types/api'

export const accountsApi = {
  create: async (request: CreateAccountRequest): Promise<AccountViewModel> => {
    const { data } = await apiClient.post<AccountViewModel>('/api/accounts', request)
    return data
  },
  addTransaction: async (
    accountId: string,
    request: CreateTransactionRequest,
  ): Promise<TransactionViewModel> => {
    const { data } = await apiClient.post<TransactionViewModel>(
      `/api/accounts/${accountId}/transactions`,
      request,
    )
    return data
  },
}