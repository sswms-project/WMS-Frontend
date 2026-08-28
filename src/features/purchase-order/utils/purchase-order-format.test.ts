import { describe, expect, it } from 'vitest'
import {
  formatOperationalDate,
  formatOperationalDateTime,
  toOperationalDateApiValue,
  toOperationalDateInputValue,
} from './purchase-order-format'

describe('purchase order operational date utilities', () => {
  it('serializes a date input without applying the browser timezone', () => {
    expect(toOperationalDateApiValue('2026-08-27')).toBe('2026-08-27T00:00:00.000Z')
    expect(toOperationalDateApiValue('')).toBeNull()
  })

  it('hydrates canonical and legacy local-midnight values to the same business date', () => {
    expect(toOperationalDateInputValue('2026-08-27T00:00:00.000Z')).toBe('2026-08-27')
    expect(toOperationalDateInputValue('2026-08-26T17:00:00.000Z')).toBe('2026-08-27')
  })

  it('keeps the date stable through repeated form round trips', () => {
    let formValue = '2026-08-27'

    for (let saveCount = 0; saveCount < 3; saveCount += 1) {
      const apiValue = toOperationalDateApiValue(formValue)
      formValue = toOperationalDateInputValue(apiValue)
    }

    expect(formValue).toBe('2026-08-27')
  })

  it('returns safe fallback values for absent or invalid dates', () => {
    expect(toOperationalDateInputValue(null)).toBe('')
    expect(toOperationalDateInputValue('not-a-date')).toBe('')
    expect(formatOperationalDate(null)).toBe('Chưa xác định')
    expect(formatOperationalDate(undefined)).toBe('Chưa xác định')
    expect(formatOperationalDate('not-a-date')).toBe('Không xác định')
    expect(formatOperationalDateTime(null)).toBe('Không xác định')
    expect(formatOperationalDateTime(undefined)).toBe('Không xác định')
    expect(formatOperationalDateTime('not-a-date')).toBe('Không xác định')
  })
})
