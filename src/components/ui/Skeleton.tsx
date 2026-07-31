import { cn } from '../../utils/cn'

interface SkeletonProps {
  className?: string
}

/** Base shimmer block. Compose the shape-specific helpers below rather than using this directly on a page. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-surface-sunken', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[ft-shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
    </div>
  )
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={cn('h-3', index === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      <SkeletonText lines={3} className="mt-4" />
    </div>
  )
}

export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export function SkeletonChart({ className }: { className?: string }) {
  return <Skeleton className={cn('h-64 w-full', className)} />
}
