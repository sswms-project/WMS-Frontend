import { describe, expect, it } from 'vitest'
import type { WarehouseSummaryResponse } from '../types/manager-assignment.types'
import { getActiveWarehouses } from './active-warehouses'

const warehouses: WarehouseSummaryResponse[] = [
  {
    id: 'active-warehouse',
    warehouseCode: 'HCM-01',
    warehouseName: 'Kho Thu Duc',
    address: 'Ho Chi Minh City',
    status: 'Active',
    createdAt: '2026-08-19T00:00:00Z',
  },
  {
    id: 'inactive-warehouse',
    warehouseCode: 'HN-01',
    warehouseName: 'Kho Ha Noi',
    address: 'Ha Noi',
    status: 'Inactive',
    createdAt: '2026-08-19T00:00:00Z',
  },
]

describe('getActiveWarehouses', () => {
  it('removes inactive warehouses from assignment options', () => {
    expect(getActiveWarehouses(warehouses)).toEqual([warehouses[0]])
  })

  it('does not mutate the API response', () => {
    getActiveWarehouses(warehouses)

    expect(warehouses).toHaveLength(2)
  })
})
