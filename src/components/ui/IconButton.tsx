import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Spinner } from './Spinner'

type IconButtonVariant = 'primary' | 'secondary' | 'ghost'
type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  isLoading?: boolean
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  primary: 'bg-ft-gold text-ft-navy hover:bg-ft-gold-dark focus-visible:outline-ft-gold-dark',
  secondary:
    'bg-surface-elevated text-text-primary border border-border-strong hover:bg-surface-sunken focus-visible:outline-ft-blue',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:outline-ft-blue',
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

/** Icon-only button. `label` is required and becomes the accessible name via aria-label. */
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" /> : icon}
    </button>
  )
}
