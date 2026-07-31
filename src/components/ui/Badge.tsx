import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type BadgeVariant = 'neutral' | 'gold' | 'good' | 'warning' | 'serious' | 'critical'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  icon?: ReactNode
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-sunken text-text-secondary',
  gold: 'bg-ft-gold/15 text-ft-gold-ink dark:text-ft-gold',
  good: 'bg-status-good/15 text-status-good',
  warning: 'bg-status-warning/20 text-ft-navy dark:text-status-warning',
  serious: 'bg-status-serious/15 text-status-serious',
  critical: 'bg-status-critical/15 text-status-critical',
}

/** Status/label pill. Always pair a status variant with an icon or explicit text — never color alone. */
export function Badge({ variant = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {icon && <span className="h-3 w-3 shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
