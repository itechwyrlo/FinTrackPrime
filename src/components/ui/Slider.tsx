import * as RadixSlider from '@radix-ui/react-slider'
import { useId } from 'react'
import { cn } from '../../utils/cn'

interface SliderProps {
  label: string
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step?: number
  formatValue?: (value: number) => string
  disabled?: boolean
}

export function Slider({ label, value, onValueChange, min, max, step = 1, formatValue, disabled }: SliderProps) {
  const id = useId()

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        <span className="tabular-figure text-sm font-semibold text-ft-navy dark:text-ft-gold">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <RadixSlider.Root
        id={id}
        className={cn('relative flex h-5 w-full touch-none items-center', disabled && 'opacity-50')}
        value={[value]}
        onValueChange={([next]) => onValueChange(next)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      >
        <RadixSlider.Track className="relative h-1.5 w-full grow rounded-full bg-surface-sunken">
          <RadixSlider.Range className="absolute h-full rounded-full bg-ft-gold" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          aria-label={label}
          className="block h-5 w-5 rounded-full border-2 border-ft-gold bg-surface-elevated shadow outline-none transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ft-blue"
        />
      </RadixSlider.Root>
    </div>
  )
}
