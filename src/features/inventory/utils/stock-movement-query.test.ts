import { describe, expect, it } from 'vitest'
import { buildStockMovementQuery, isStockMovementDateRangeValid } from './stock-movement-query'

describe('stock movement query', () => {
  it('removes empty filters and preserves pagination', () => {
    expect(
      buildStockMovementQuery({ productId: '', movementType: '', dateFrom: '', dateTo: '' }, 2, 20)
    ).toEqual({ pageNumber: 2, pageSize: 20 })
  })

  it('maps supported filters to exact backend parameters', () => {
    const query = buildStockMovementQuery(
      {
        productId: 'product-1',
        movementType: 'Adjustment',
        dateFrom: '2026-08-01',
        dateTo: '2026-08-24',
      },
      1,
      20
    )

    expect(query).toEqual({
      pageNumber: 1,
      pageSize: 20,
      productId: 'product-1',
      movementType: 'Adjustment',
      dateFrom: new Date('2026-08-01T00:00:00.000').toISOString(),
      dateTo: new Date('2026-08-24T23:59:59.999').toISOString(),
    })
  })

  it.each([
    ['', '', true],
    ['2026-08-01', '2026-08-24', true],
    ['2026-08-24', '2026-08-01', false],
  ])('validates date range %s to %s', (dateFrom, dateTo, expected) => {
    expect(isStockMovementDateRangeValid(dateFrom, dateTo)).toBe(expected)
  })
})
