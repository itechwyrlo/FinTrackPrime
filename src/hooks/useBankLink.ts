import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bankLinkApi } from '../api/bankLink'
import { useToast } from '../components/ui/Toast'

/**
 * Shared by TopNav's quick actions and DashboardPage's own controls, so
 * "connect a bank" and "sync now" behave identically everywhere they
 * appear (same toasts, same query invalidation).
 */
export function useBankLink() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const connect = useMutation({
    mutationFn: bankLinkApi.startLink,
    onSuccess: ({ linkUrl }) => {
      // Full-page navigation, not a popup/iframe: Finverse's Link UI
      // redirects back to our own /bank-link/callback route with a
      // code, the same shape as a standard OAuth authorization-code
      // flow, so the browser needs to actually leave this page.
      window.location.href = linkUrl
    },
    onError: () => toast({ title: "Couldn't start connecting your bank", variant: 'error' }),
  })

  const sync = useMutation({
    mutationFn: bankLinkApi.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({ title: 'Accounts synced', variant: 'success' })
    },
    onError: () => toast({ title: "Couldn't sync your accounts", variant: 'error' }),
  })

  // Confirming before a destructive action is the caller's job (it needs
  // to own the "are you sure?" UX), not this hook's — this only performs
  // the disconnect once the caller has already decided to go through with it.
  const disconnectAll = useMutation({
    mutationFn: bankLinkApi.disconnectAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({ title: 'Disconnected all banks', variant: 'success' })
    },
    onError: () => toast({ title: "Couldn't disconnect", variant: 'error' }),
  })

  return { connect, sync, disconnectAll }
}
