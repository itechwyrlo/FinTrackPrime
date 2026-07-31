import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  options: SelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  icon?: ReactNode
}

export function Select({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  error,
  helperText,
  disabled,
  icon,
}: SelectProps) {
  const triggerId = useId()
  const helperId = `${triggerId}-helper`
  const errorId = `${triggerId}-error`

  return (
    <div className="w-full">
      <label htmlFor={triggerId} className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={triggerId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg border bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none transition-colors',
            'data-[state=open]:border-ft-blue data-[state=open]:ring-2 data-[state=open]:ring-ft-blue/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-status-critical' : 'border-border-strong',
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {icon && <span className="shrink-0 text-text-muted">{icon}</span>}
            <RadixSelect.Value placeholder={placeholder} />
          </span>
          <RadixSelect.Icon className="shrink-0 text-text-muted">
            <ChevronDown className="h-4 w-4" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-64 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border-strong bg-surface-elevated shadow-lg"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-text-primary outline-none',
                    'data-[highlighted]:bg-surface-sunken',
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check className="h-4 w-4 text-ft-blue" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
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
