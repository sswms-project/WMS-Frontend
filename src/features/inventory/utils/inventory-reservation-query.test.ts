import { describe, expect, it } from 'vitest'
import { buildInventoryReservationQuery } from './inventory-reservation-query'

describe('buildInventoryReservationQuery', () => {
  it.each([
    ['', '', { status: 'Active' }],
    ['warehouse-1', '', { warehouseId: 'warehouse-1', status: 'Active' }],
    ['', 'product-1', { productId: 'product-1', status: 'Active' }],
    [
      'warehouse-1',
      'product-1',
      { warehouseId: 'warehouse-1', productId: 'product-1', status: 'Active' },
    ],
  ])('normalizes warehouse %s and product %s', (warehouseId, productId, expected) => {
    expect(buildInventoryReservationQuery(warehouseId, productId, 'Active')).toEqual(expected)
  })

  it('keeps requested history status', () => {
    expect(buildInventoryReservationQuery('', '', 'Consumed')).toEqual({ status: 'Consumed' })
  })
})
