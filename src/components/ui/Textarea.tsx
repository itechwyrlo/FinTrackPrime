import { useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
}

export function Textarea({ label, error, helperText, id, className, ...textareaProps }: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const helperId = `${textareaId}-helper`
  const errorId = `${textareaId}-error`

  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'w-full min-w-0 resize-y rounded-lg border bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted',
          'focus:border-ft-blue focus:ring-2 focus:ring-ft-blue/20',
          error ? 'border-status-critical' : 'border-border-strong',
        )}
        {...textareaProps}
      />
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
