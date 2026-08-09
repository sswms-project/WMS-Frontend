import { describe, expect, it } from 'vitest'
import { buildWarehouseQuery } from './warehouse-query'

describe('buildWarehouseQuery', () => {
  it('builds the first-page query without blank search text', () => {
    expect(buildWarehouseQuery('   ', 1, 10)).toEqual({
      top: 10,
      skip: 0,
      needTotalCount: true,
    })
  })

  it('trims search text and derives the correct offset for later pages', () => {
    expect(buildWarehouseQuery('  HCM-01  ', 3, 10)).toEqual({
      top: 10,
      skip: 20,
      needTotalCount: true,
      searchText: 'HCM-01',
    })
  })
})
