import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  it('keeps the previous value until the configured delay completes', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'HCM' },
    })

    rerender({ value: 'HCM-01' })
    expect(result.current).toBe('HCM')

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('HCM-01')
    vi.useRealTimers()
  })
})
