import { describe, expect, it } from 'vitest'
import type { ZoneResponse } from '@/types/warehouse'
import { buildWarehouseLayoutHref, getWarehouseLayoutSelection } from './warehouse-layout-route'

const zones: ZoneResponse[] = [
  {
    id: 'zone-1',
    zoneCode: 'A',
    zoneName: 'Khu A',
    description: null,
    status: 'Active',
    racks: [
      {
        id: 'rack-1',
        rackCode: 'A-01',
        rackName: 'Kệ A-01',
        status: 'Active',
        slots: [],
      },
    ],
  },
]

describe('buildWarehouseLayoutHref', () => {
  it('builds a deep link for the selected zone and rack', () => {
    expect(buildWarehouseLayoutHref('warehouse-1', 'zone-1', 'rack-1')).toBe(
      '/warehouses/warehouse-1/layout?zone=zone-1&rack=rack-1'
    )
  })

  it('omits rack selection when no zone is selected', () => {
    expect(buildWarehouseLayoutHref('warehouse-1', null, 'rack-1')).toBe(
      '/warehouses/warehouse-1/layout'
    )
  })
})

describe('getWarehouseLayoutSelection', () => {
  it('returns only selections that still exist in the loaded layout', () => {
    expect(getWarehouseLayoutSelection(zones, 'zone-1', 'missing-rack')).toEqual({
      selectedZoneId: 'zone-1',
      selectedRackId: null,
    })
    expect(getWarehouseLayoutSelection(zones, 'missing-zone', 'rack-1')).toEqual({
      selectedZoneId: null,
      selectedRackId: null,
    })
  })
})
