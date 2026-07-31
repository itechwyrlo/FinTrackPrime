import { cn } from '../../utils/cn'

type SpinnerSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-3.5 w-3.5 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

/** Compact inline spinner for buttons, dropdowns, and other localized loading. */
export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent opacity-80',
        SIZE_CLASSES[size],
        className,
      )}
    />
  )
}
