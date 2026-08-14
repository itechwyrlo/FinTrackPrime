import { useEffect } from 'react'
import { HubConnectionBuilder, HttpTransportType, LogLevel, type HubConnection } from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { authSession } from '../api/authSession'
import { useToast } from '../components/ui/Toast'
import type { NotificationViewModel } from '../types/api'

const HUB_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/hubs/notifications`

/**
 * One SignalR connection per authenticated session. accessTokenFactory is
 * called by the SignalR client on every (re)connect attempt, so a token
 * refreshed mid-session (see api/client.ts's response interceptor) is
 * picked up automatically without this hook needing to know that
 * happened.
 */
export function useNotificationsHub(isAuthenticated: boolean) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let connection: HubConnection | null = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => authSession.get()?.token ?? '',
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('ReceiveNotification', (notification: NotificationViewModel) => {
      toast({ title: notification.title, description: notification.message, variant: 'warning' })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    connection.start().catch(() => {
      // Best-effort: a failed connection just means no live push this
      // session. GET /api/notifications (polled on mount, on window
      // focus, and by TanStack Query's own defaults) still surfaces
      // anything the user missed.
    })

    return () => {
      connection?.stop()
      connection = null
    }
  }, [isAuthenticated, queryClient, toast])
}
