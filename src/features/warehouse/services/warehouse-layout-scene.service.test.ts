import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { SaveWarehouseLayoutSceneRequest } from '../types/warehouse-layout-scene.types'
import { warehouseLayoutSceneService } from './warehouse-layout-scene.service'

const axios = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }))

vi.mock('@/lib/axios', () => ({ axiosClient: axios }))

describe('warehouseLayoutSceneService', () => {
  beforeEach(() => {
    axios.get.mockReset()
    axios.put.mockReset()
  })

  it('reads the dedicated editable scene endpoint', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: { version: 0 } }
    axios.get.mockResolvedValue({ data: response })

    await expect(warehouseLayoutSceneService.getScene('warehouse-1')).resolves.toEqual(response)
    expect(axios.get).toHaveBeenCalledWith('/warehouses/warehouse-1/layout/scene')
  })

  it('sends one complete batch to the same endpoint', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: null }
    axios.put.mockResolvedValue({ data: response })
    const request: SaveWarehouseLayoutSceneRequest = {
      warehouseId: 'warehouse-1',
      version: 2,
      canvas: { width: 1000, height: 600, gridSize: 20 },
      zones: [],
      racks: [],
      decorations: [],
    }

    await warehouseLayoutSceneService.saveScene('warehouse-1', request)

    expect(API_ENDPOINTS.warehouses.layoutScene('warehouse-1')).toBe(
      '/warehouses/warehouse-1/layout/scene'
    )
    expect(axios.put).toHaveBeenCalledTimes(1)
    expect(axios.put).toHaveBeenCalledWith('/warehouses/warehouse-1/layout/scene', request)
  })
})
