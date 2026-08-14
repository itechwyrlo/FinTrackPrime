import { apiClient, refreshAccessToken } from './client'
import type { AuthResponse, GoogleLoginRequest, LoginRequest, RegisterRequest } from '../types/api'

export const authApi = {
  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', request)
    return data
  }, 
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', request)
    return data
  },
  google: async (request: GoogleLoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/google', request)
    return data
  },
  // Shares the same in-flight promise the response interceptor uses, so
  // a bootstrap call and a reactive 401 refresh never race each other.
  refresh: refreshAccessToken,
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout')
  },
}
