import * as RadixProgress from '@radix-ui/react-progress'
import { cn } from '../../utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  className?: string
}

export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
          <span>{label}</span>
          <span className="tabular-figure">{Math.round(percent)}%</span>
        </div>
      )}
      <RadixProgress.Root
        value={percent}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
      >
        <RadixProgress.Indicator
          className="h-full rounded-full bg-ft-gold transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${100 - percent}%)` }}
        />
      </RadixProgress.Root>
    </div>
  )
}
