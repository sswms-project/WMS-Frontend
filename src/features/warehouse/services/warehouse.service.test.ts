import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { warehouseService } from './warehouse.service'

const axios = vi.hoisted(() => ({
  patch: vi.fn(),
}))

vi.mock('@/lib/axios', () => ({
  axiosClient: axios,
}))

describe('warehouseService.deactivateWarehouse', () => {
  beforeEach(() => {
    axios.patch.mockReset()
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
})
