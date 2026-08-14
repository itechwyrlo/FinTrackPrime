import { apiClient } from './client'
import type { NotificationListViewModel } from '../types/api'

export const notificationsApi = {
  list: async (page = 1, pageSize = 20): Promise<NotificationListViewModel> => {
    const { data } = await apiClient.get<NotificationListViewModel>('/api/notifications', {
      params: { page, pageSize },
    })
    return data
  },
  markRead: async (notificationId: string): Promise<void> => {
    await apiClient.post(`/api/notifications/${notificationId}/read`)
  },
  markAllRead: async (): Promise<void> => {
    await apiClient.post('/api/notifications/read-all')
  },
}
