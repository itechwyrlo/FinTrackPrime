import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { notificationsApi } from '../api/notifications'
import { Button } from './ui/Button'
import { EmptyState } from './ui/EmptyState'
import { Spinner } from './ui/Spinner'

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMinutes = Math.round(diffMs / 60_000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.round(diffHours / 24)}d ago`
}

/** Rendered inside TopNav's Notifications DropdownMenu `header` slot — that
 * slot is a plain content area (not the `items` list, which is only a flat
 * list of one-line actions), so it can host this full interactive list. */
export function NotificationList() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-text-muted">
        <Spinner size="sm" /> Loading…
      </p>
    )
  }

  if (!data || data.items.length === 0) {
    return <EmptyState title="No notifications yet" />
  }

  return (
    <div className="w-72">
      <div className="flex items-center justify-between pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Notifications</p>
        {data.unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => notificationsApi.markAllRead().then(invalidate)}
          >
            Mark all read
          </Button>
        )}
      </div>
      <ul className="max-h-80 space-y-1 overflow-y-auto">
        {data.items.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => {
                if (!notification.isRead) {
                  notificationsApi.markRead(notification.id).then(invalidate)
                }
              }}
              className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-surface-sunken"
            >
              <AlertTriangle
                className={`mt-0.5 h-4 w-4 shrink-0 ${notification.isRead ? 'text-text-muted' : 'text-status-warning'}`}
              />
              <span className="min-w-0 flex-1">
                <span className={`block truncate ${notification.isRead ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>
                  {notification.title}
                </span>
                <span className="block truncate text-xs text-text-muted">{notification.message}</span>
                <span className="block text-xs text-text-muted">{formatRelativeTime(notification.createdAtUtc)}</span>
              </span>
              {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-warning" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
