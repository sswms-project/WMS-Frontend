import { describe, expect, it } from 'vitest'
import type { WarehouseSummaryResponse } from '../types/manager-assignment.types'
import { resolveStaffWarehouseScope, staffWarehouseScopeLabel } from './staff-warehouse'

const warehouses: WarehouseSummaryResponse[] = [
  {
    id: 'warehouse-a',
    warehouseCode: 'HCM-01',
    warehouseName: 'Kho trung tâm',
    address: null,
    status: 'Active',
    createdAt: '2026-08-08T00:00:00Z',
  },
  {
    id: 'warehouse-b',
    warehouseCode: 'HN-01',
    warehouseName: 'Kho miền Bắc',
    address: null,
    status: 'Inactive',
    createdAt: '2026-08-08T00:00:00Z',
  },
]

describe('staff warehouse scope', () => {
  it('resolves assignments in backend order and counts unavailable warehouses', () => {
    const result = resolveStaffWarehouseScope(
      ['warehouse-b', 'missing-warehouse', 'warehouse-a'],
      warehouses
    )

    expect(result.warehouses.map((warehouse) => warehouse.id)).toEqual([
      'warehouse-b',
      'warehouse-a',
    ])
    expect(result.unresolvedCount).toBe(1)
  })

  it('formats compact assignment counts', () => {
    expect(staffWarehouseScopeLabel(0)).toBe('Chưa gán kho')
    expect(staffWarehouseScopeLabel(2)).toBe('2 kho được gán')
  })
})
