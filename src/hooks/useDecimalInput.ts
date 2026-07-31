import { useState, type FocusEvent, type ChangeEvent } from 'react'
import { cleanDecimalDraft, parseAmountInput } from '../utils/number'

// Backs every editable dollar/quantity field in the premium tools.
// Renders as type="text" so the browser never draws spinner arrows,
// shows a fixed-decimal value like "0.00" when not focused (never
// blank, never a bare "0"), and while focused shows exactly what was
// typed so reformatting mid-keystroke can't fight the cursor.
export function useDecimalInput({
  value,
  onChange,
  decimals = 2,
}: {
  value: number
  onChange: (value: number) => void
  decimals?: number
}) {
  const [draft, setDraft] = useState<string | null>(null)

  return {
    value: draft ?? value.toFixed(decimals),
    type: 'text' as const,
    inputMode: 'decimal' as const,
    onFocus: (e: FocusEvent<HTMLInputElement>) => e.target.select(),
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const cleaned = cleanDecimalDraft(e.target.value)
      setDraft(cleaned)
      onChange(parseAmountInput(cleaned))
    },
    onBlur: () => setDraft(null),
  }
}
