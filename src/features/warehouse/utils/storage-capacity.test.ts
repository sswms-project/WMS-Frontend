import { describe, expect, it } from 'vitest'
import {
  formatStorageCapacity,
  getCapacityFormValues,
  getCapacityUpdateValues,
  getCapacityUtilization,
} from './storage-capacity'
import { mapWarehouseLayoutScene } from './layout-scene-mapper'
import type { WarehouseLayoutSceneResponse } from '../types/warehouse-layout-scene.types'

describe('storage capacity display and mapping', () => {
  it('centralizes warning/full thresholds and clamps the visual bar without hiding over-capacity', () => {
    const location = { capacityType: 'Quantity' as const, capacity: 20 }
    expect(getCapacityUtilization({ ...location, capacityUsed: 15.99 })?.status).toBe('normal')
    expect(getCapacityUtilization({ ...location, capacityUsed: 16 })?.status).toBe('warning')
    expect(getCapacityUtilization({ ...location, capacityUsed: 22 })).toMatchObject({
      status: 'full',
      percent: 100,
    })
    expect(getCapacityUtilization({ ...location, capacityUsed: 22 })?.rawPercent).toBeCloseTo(110)
    expect(getCapacityUtilization({ ...location, capacity: 0, capacityUsed: 0 })).toBeNull()
    expect(getCapacityUtilization({ ...location, capacityUsed: Number.NaN })).toBeNull()
  })
  it('uses normalized capacityUsed, not the legacy/base occupancy', () => {
    expect(
      formatStorageCapacity({
        capacityType: 'Quantity',
        capacity: 20,
        capacityUsed: 8,
        currentOccupancy: 192,
        remainingCapacity: 12,
        utilizationPercent: 40,
        capacityUnitName: 'Thùng',
      })
    ).toBe('8 / 20 Thùng · Còn 12 · 40%')
  })
  it('does not invent a percentage or numeric occupancy for unlimited or pending', () => {
    expect(formatStorageCapacity({ capacityType: 'None', currentOccupancy: 900 })).toBe(
      'Không giới hạn'
    )
    expect(
      formatStorageCapacity({
        capacityType: 'None',
        capacity: 20,
        requiresCapacityConfiguration: true,
      })
    ).toBe('Cần cấu hình đơn vị sức chứa')
  })
  it('keeps legacy limits in update payloads unless the user explicitly changes policy', () => {
    const legacy = {
      capacity: 20,
      capacityType: 'None' as const,
      requiresCapacityConfiguration: true,
    }
    expect(getCapacityFormValues(legacy)).toEqual({
      capacityType: 'None',
      capacity: null,
      capacityUnitId: null,
    })
    expect(legacy.capacity).toBe(20)
    expect(getCapacityUpdateValues(legacy, true)).toEqual({
      capacityType: undefined,
      capacity: 20,
      capacityUnitId: null,
    })
    expect(getCapacityUpdateValues(legacy, false)).toEqual({})
    expect(getCapacityUpdateValues({ capacityType: 'None' }, true)).toEqual({})
  })
  it('preserves capacity metadata when mapping a scene to the editor', () => {
    const scene: WarehouseLayoutSceneResponse = {
      warehouseId: 'warehouse',
      version: 1,
      canvas: { width: 800, height: 600, gridSize: 10 },
      zones: [],
      decorations: [],
      slots: [],
      racks: [
        {
          id: 'rack',
          zoneId: 'zone',
          zoneCode: 'Z',
          rackCode: 'R',
          rackName: 'Kệ',
          description: null,
          status: 'Active',
          storageMode: 'RackLevel',
          x: 40,
          y: 40,
          width: 160,
          height: 60,
          rotation: 0,
          zIndex: 1,
          capacityType: 'Quantity',
          capacity: 20,
          capacityUsed: 8,
          capacityUnitId: 'unit',
          capacityUnitName: 'Thùng',
          remainingCapacity: 12,
          utilizationPercent: 40,
        },
      ],
    }
    expect(mapWarehouseLayoutScene(scene).editorScene.racks[0]).toMatchObject({
      capacityType: 'Quantity',
      capacityUsed: 8,
      capacityUnitId: 'unit',
      remainingCapacity: 12,
    })
  })
})
