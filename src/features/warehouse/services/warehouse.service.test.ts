import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { warehouseService } from './warehouse.service'

const axios = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('@/lib/axios', () => ({
  axiosClient: axios,
}))

describe('warehouseService.deactivateWarehouse', () => {
  beforeEach(() => {
    axios.patch.mockReset()
    axios.get.mockReset()
    axios.post.mockReset()
    axios.put.mockReset()
  })

  it('calls the warehouse deactivation endpoint without a request body', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: null }
    axios.patch.mockResolvedValue({ data: response })

    await expect(warehouseService.deactivateWarehouse('warehouse-1')).resolves.toEqual(response)

    expect(API_ENDPOINTS.warehouses.deactivate('warehouse-1')).toBe(
      '/warehouses/warehouse-1/deactivate'
    )
    expect(axios.patch).toHaveBeenCalledWith('/warehouses/warehouse-1/deactivate')
  })

  it('passes generalized location search parameters to the warehouse route', async () => {
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: '',
      data: { items: [], totalCount: 0 },
    }
    axios.get.mockResolvedValue({ data: response })
    const params = {
      top: 20,
      skip: 0,
      needTotalCount: true as const,
      type: 'Rack' as const,
      lifecycleStatus: 'Active' as const,
      zoneId: 'zone-1',
    }

    await expect(warehouseService.getLocations('warehouse-1', params)).resolves.toEqual(response)
    expect(axios.get).toHaveBeenCalledWith('/warehouses/warehouse-1/locations', { params })
  })

  it('uses route hierarchy for rack update and typed barcode lookup', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: null }
    axios.put.mockResolvedValue({ data: response })
    axios.get.mockResolvedValue({ data: response })

    await warehouseService.updateRack('warehouse-1', 'zone-1', 'rack-1', {
      rackCode: 'R-01',
      rackName: 'Kệ 01',
    })
    await warehouseService.getLocationBarcode('warehouse-1', 'Rack', 'rack-1')

    expect(axios.put).toHaveBeenCalledWith('/warehouses/warehouse-1/zones/zone-1/racks/rack-1', {
      rackCode: 'R-01',
      rackName: 'Kệ 01',
    })
    expect(axios.get).toHaveBeenCalledWith('/warehouses/warehouse-1/locations/rack/rack-1/barcode')
  })
})
