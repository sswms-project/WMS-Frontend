import { describe, expect, it } from 'vitest'
import { staffEmploymentPeriodSchema } from '../schemas/staff-employment-period.schema'
import type { StaffEmploymentPeriod } from '../types/staff.types'
import {
  canEditEmploymentEndDate,
  formatEmploymentDate,
  getEmploymentPeriodLabel,
} from './staff-employment'

const basePeriod: StaffEmploymentPeriod = {
  id: 'period-1',
  userId: 'user-1',
  startDate: '2026-01-05',
  endDate: null,
  isCurrent: false,
  isEndDateUnknown: false,
  isCurrentAccount: true,
}

describe('staff employment formatting', () => {
  it('formats ISO dates without timezone shifts', () => {
    expect(formatEmploymentDate('2026-01-05')).toBe('05/01/2026')
  })

  it('labels current, closed and unknown-end periods', () => {
    expect(getEmploymentPeriodLabel({ ...basePeriod, isCurrent: true })).toBe('05/01/2026 – nay')
    expect(getEmploymentPeriodLabel({ ...basePeriod, endDate: '2026-03-01' })).toBe(
      '05/01/2026 – 01/03/2026'
    )
    expect(getEmploymentPeriodLabel({ ...basePeriod, isEndDateUnknown: true })).toBe(
      '05/01/2026 – chưa rõ'
    )
  })

  it('only lets non-current periods change the end date', () => {
    expect(canEditEmploymentEndDate({ ...basePeriod, isCurrent: true })).toBe(false)
    expect(canEditEmploymentEndDate({ ...basePeriod, endDate: '2026-03-01' })).toBe(true)
  })
})

describe('staffEmploymentPeriodSchema', () => {
  it('accepts a valid range and an open-ended start date', () => {
    expect(
      staffEmploymentPeriodSchema.safeParse({ startDate: '2025-01-01', endDate: '2025-06-30' })
        .success
    ).toBe(true)
    expect(
      staffEmploymentPeriodSchema.safeParse({ startDate: '2025-01-01', endDate: '' }).success
    ).toBe(true)
  })

  it('rejects end before start, future dates and malformed values', () => {
    expect(
      staffEmploymentPeriodSchema.safeParse({ startDate: '2025-06-30', endDate: '2025-01-01' })
        .success
    ).toBe(false)
    expect(
      staffEmploymentPeriodSchema.safeParse({ startDate: '2999-01-01', endDate: '' }).success
    ).toBe(false)
    expect(staffEmploymentPeriodSchema.safeParse({ startDate: '', endDate: '' }).success).toBe(
      false
    )
  })
})
