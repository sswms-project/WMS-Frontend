import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress } from './progress'

describe('Progress accessibility', () => {
  it.each([
    [0, 'loading'],
    [50, 'loading'],
    [100, 'complete'],
  ])('passes %s to Radix', (value, state) => {
    render(<Progress value={value} aria-label="Tiến độ" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(value))
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', state)
  })
  it('preserves indeterminate progress when no value is known', () => {
    render(<Progress aria-label="Đang tải" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'indeterminate')
  })
})
