import { describe, expect, it } from 'vitest'
import { buildInventoryReservationQuery } from './inventory-reservation-query'

describe('buildInventoryReservationQuery', () => {
  it.each([
    ['', '', {}],
    ['warehouse-1', '', { warehouseId: 'warehouse-1' }],
    ['', 'product-1', { productId: 'product-1' }],
    ['warehouse-1', 'product-1', { warehouseId: 'warehouse-1', productId: 'product-1' }],
  ])('normalizes warehouse %s and product %s', (warehouseId, productId, expected) => {
    expect(buildInventoryReservationQuery(warehouseId, productId)).toEqual(expected)
  })
})
