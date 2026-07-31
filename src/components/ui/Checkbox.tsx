import { useId, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: string
}

export function Checkbox({ label, id, className, checked, ...inputProps }: CheckboxProps) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <label htmlFor={checkboxId} className={cn('inline-flex cursor-pointer items-center gap-2', className)}>
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded border border-border-strong bg-surface-elevated outline-none checked:border-ft-gold checked:bg-ft-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ft-blue"
          {...inputProps}
        />
        <Check className="pointer-events-none h-3.5 w-3.5 text-ft-navy opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="text-sm text-text-primary">{label}</span>
    </label>
  )
}
