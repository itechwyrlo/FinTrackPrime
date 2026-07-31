import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type InputVariant = 'text' | 'currency' | 'percent'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  helperText?: string
  variant?: InputVariant
  icon?: ReactNode
  /** Right-aligned interactive element, e.g. a password show/hide toggle. Distinct from `icon` (left, decorative). */
  trailingAction?: ReactNode
}

/**
 * Text input with a floating label, optional helper/error text, and
 * currency ($) / percent (%) affix variants. Every page-level currency
 * or percent field (loan amount, interest rate, budget category amount,
 * etc.) should use this instead of a bare <input> so the affix and
 * tabular-figure alignment stay consistent.
 */
export function Input({
  label,
  error,
  helperText,
  variant = 'text',
  icon,
  trailingAction,
  id,
  className,
  ...inputProps
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`
  const isCurrency = variant === 'currency'
  const isPercent = variant === 'percent'

  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-surface-elevated px-3 py-2 transition-colors',
          'focus-within:border-ft-blue focus-within:ring-2 focus-within:ring-ft-blue/20',
          error ? 'border-status-critical' : 'border-border-strong',
        )}
      >
        {icon && <span className="shrink-0 text-text-muted">{icon}</span>}
        {isCurrency && <span className="shrink-0 text-sm text-text-muted">$</span>}
        <input
          id={inputId}
          inputMode={isCurrency || isPercent ? 'decimal' : inputProps.inputMode}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted',
            (isCurrency || isPercent) && 'tabular-figure',
          )}
          {...inputProps}
        />
        {isPercent && <span className="shrink-0 text-sm text-text-muted">%</span>}
        {trailingAction && <span className="shrink-0">{trailingAction}</span>}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-status-critical">
          {error}
        </p>
      ) : (
        helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-text-muted">
            {helperText}
          </p>
        )
      )}
    </div>
  )
}
