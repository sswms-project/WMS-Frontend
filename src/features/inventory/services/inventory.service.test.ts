import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { StockMovementListQuery } from '../types/inventory.types'
import { inventoryService } from './inventory.service'

vi.mock('@/lib/axios', () => ({
  axiosClient: { get: vi.fn() },
}))

describe('inventoryService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls the current backend endpoint once with the exact query', async () => {
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 20 },
    }
    vi.mocked(axiosClient.get).mockResolvedValue({ data: response })
    const params = { pageNumber: 1, pageSize: 20, searchTerm: 'SKU-01' }

    await expect(inventoryService.getInventory(params)).resolves.toEqual(response)
    expect(axiosClient.get).toHaveBeenCalledTimes(1)
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.inventory.list, { params })
  })

  it('calls stock movements once with the exact backend query', async () => {
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 20 },
    }
    vi.mocked(axiosClient.get).mockResolvedValue({ data: response })
    const params: StockMovementListQuery = {
      pageNumber: 1,
      pageSize: 20,
      productId: 'product-1',
      movementType: 'Inbound',
    }

    await expect(inventoryService.getStockMovements(params)).resolves.toEqual(response)
    expect(axiosClient.get).toHaveBeenCalledTimes(1)
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.inventory.movements, { params })
  })
})
