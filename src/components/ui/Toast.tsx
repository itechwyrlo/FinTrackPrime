import * as RadixToast from '@radix-ui/react-toast'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type ToastVariant = 'info' | 'success' | 'warning' | 'error'

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastRecord extends ToastInput {
  id: string
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
  info: <Info className="h-5 w-5 text-ft-blue" />,
  success: <CheckCircle2 className="h-5 w-5 text-status-good" />,
  warning: <AlertTriangle className="h-5 w-5 text-status-warning" />,
  error: <XCircle className="h-5 w-5 text-status-critical" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, variant: 'info', ...input }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right" duration={5000}>
        {children}
        {toasts.map((item) => (
          <RadixToast.Root
            key={item.id}
            onOpenChange={(open) => !open && dismiss(item.id)}
            className={cn(
              'flex items-start gap-3 rounded-lg border border-border-strong bg-surface-elevated p-4 shadow-lg',
              'data-[state=open]:animate-[ft-toast-in_150ms_ease-out] data-[state=closed]:animate-[ft-toast-out_150ms_ease-in]',
              'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
            )}
          >
            <span className="shrink-0">{VARIANT_ICON[item.variant ?? 'info']}</span>
            <div className="min-w-0 flex-1">
              <RadixToast.Title className="text-sm font-semibold text-text-primary">{item.title}</RadixToast.Title>
              {item.description && (
                <RadixToast.Description className="mt-0.5 text-sm text-text-secondary">
                  {item.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close aria-label="Dismiss notification" className="shrink-0 text-text-muted hover:text-text-primary">
              <X className="h-4 w-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-0 right-0 z-[100] m-0 flex w-full max-w-sm list-none flex-col gap-2 p-4 outline-none sm:bottom-4 sm:right-4" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
