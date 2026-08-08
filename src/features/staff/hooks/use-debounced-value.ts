import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMilliseconds: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMilliseconds)
    return () => window.clearTimeout(timeoutId)
  }, [delayMilliseconds, value])

  return debouncedValue
}
