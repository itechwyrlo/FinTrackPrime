// Used by every editable dollar/number field in the app. A plain
// type="number" input can't represent "currently empty, still
// typing," it snaps back to 0, which makes it impossible to clear a
// field before typing a new value. This keeps the input as free text
// while parsing it into a real number for calculations.
export function parseAmountInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  if (cleaned === '' || cleaned === '.') return 0
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

// What to put in the input's value prop: blank instead of a literal
// "0", so clicking into an empty-looking field doesn't require
// deleting a character first.
export function amountInputValue(amount: number): string {
  return amount === 0 ? '' : String(amount)
}