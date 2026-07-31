import * as RadixSwitch from '@radix-ui/react-switch'
import { useId } from 'react'
import { cn } from '../../utils/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  showLabel?: boolean
  disabled?: boolean
}

/** Set `showLabel={false}` for icon-adjacent toggles (e.g. ThemeToggle) that still need an accessible name. */
export function Switch({ checked, onCheckedChange, label, showLabel = true, disabled }: SwitchProps) {
  const id = useId()

  return (
    <div className="inline-flex items-center gap-2">
      {showLabel && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={showLabel ? undefined : label}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full bg-surface-sunken outline-none transition-colors',
          'data-[state=checked]:bg-ft-gold',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ft-blue',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <RadixSwitch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform will-change-transform data-[state=checked]:translate-x-[22px]" />
      </RadixSwitch.Root>
    </div>
  )
}
