import { describe, expect, it } from 'vitest'
import { parseWarehouseLocationType } from './warehouse-location-type'

describe('parseWarehouseLocationType', () => {
  it('normalizes supported route values and rejects unknown types', () => {
    expect(parseWarehouseLocationType('zone')).toBe('Zone')
    expect(parseWarehouseLocationType('RACK')).toBe('Rack')
    expect(parseWarehouseLocationType('slot')).toBe('Slot')
    expect(parseWarehouseLocationType('aisle')).toBeNull()
  })
})
