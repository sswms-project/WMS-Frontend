import { describe, expect, it } from 'vitest'
import { resolveAuditLogDateRange } from './platform-services-query'

describe('resolveAuditLogDateRange', () => {
  const wednesday = new Date(2026, 8, 23, 12)

  it('resolves week presets from Monday without depending on the current clock', () => {
    expect(resolveAuditLogDateRange(new URLSearchParams('timeRange=this-week'), wednesday)).toEqual(
      {
        dateFrom: '2026-09-21',
        dateTo: '2026-09-27',
      }
    )
    expect(
      resolveAuditLogDateRange(new URLSearchParams('timeRange=week-to-date'), wednesday)
    ).toEqual({
      dateFrom: '2026-09-21',
      dateTo: '2026-09-23',
    })
  })

  it('keeps an explicit custom range', () => {
    expect(
      resolveAuditLogDateRange(
        new URLSearchParams('timeRange=custom&dateFrom=2026-09-01&dateTo=2026-09-15'),
        wednesday
      )
    ).toEqual({ dateFrom: '2026-09-01', dateTo: '2026-09-15' })
  })
})
