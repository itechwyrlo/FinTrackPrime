import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Card } from './Card'
import { SkeletonText } from './Skeleton'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  trend?: { direction: 'up' | 'down'; label: string }
  isLoading?: boolean
  className?: string
}

/** KPI tile for dashboard/summary rows. Pass `isLoading` to render a skeleton matching this exact layout. */
export function StatCard({ label, value, icon, trend, isLoading, className }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <SkeletonText lines={1} className="w-1/2" />
        <div className="mt-3 h-7 w-2/3 animate-pulse rounded bg-surface-sunken" />
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && <span className="shrink-0 text-text-muted">{icon}</span>}
      </div>
      <p className="tabular-figure mt-2 font-display text-2xl text-text-primary">{value}</p>
      {trend && (
        <p
          className={cn(
            'mt-2 flex items-center gap-1 text-xs font-medium',
            trend.direction === 'up' ? 'text-status-good' : 'text-status-critical',
          )}
        >
          {trend.direction === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend.label}
        </p>
      )}
    </Card>
  )
}
