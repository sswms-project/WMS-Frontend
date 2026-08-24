import { describe, expect, it } from 'vitest'
import { buildInventoryQuery } from './inventory-query'

describe('buildInventoryQuery', () => {
  it('normalizes blank filters and keeps pagination stable', () => {
    expect(
      buildInventoryQuery({ searchTerm: '   ', warehouseId: '', productId: '' }, 1, 20)
    ).toEqual({ pageNumber: 1, pageSize: 20 })
  })

  it('trims search and includes active filters', () => {
    expect(
      buildInventoryQuery(
        { searchTerm: '  SKU-01  ', warehouseId: 'warehouse-1', productId: 'product-1' },
        2,
        20
      )
    ).toEqual({
      pageNumber: 2,
      pageSize: 20,
      searchTerm: 'SKU-01',
      warehouseId: 'warehouse-1',
      productId: 'product-1',
    })
  })
})
