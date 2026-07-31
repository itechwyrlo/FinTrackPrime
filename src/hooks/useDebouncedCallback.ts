import { useCallback, useEffect, useRef } from 'react'

// The screen updates its own state immediately on every keystroke, so
// typing always feels instant. This only delays the network write,
// so a fast typist doesn't fire an API call per character.
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return useCallback(
    (...args: Args) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs)
    },
    [delayMs],
  )
}
