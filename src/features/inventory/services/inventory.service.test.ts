import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { StockMovementListQuery } from '../types/inventory.types'
import { inventoryService } from './inventory.service'

vi.mock('@/lib/axios', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
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
    const params = {
      pageNumber: 1,
      pageSize: 20,
      warehouseId: 'warehouse-1',
      zoneId: 'zone-1',
      searchTerm: 'SKU-01',
    }

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

  it('calls reservations once with supported filters only', async () => {
    const response = { isSuccess: true, statusCode: 200, message: 'Success', data: [] }
    vi.mocked(axiosClient.get).mockResolvedValue({ data: response })
    const params = { warehouseId: 'warehouse-1', productId: 'product-1' }

    await expect(inventoryService.getReservations(params)).resolves.toEqual(response)
    expect(axiosClient.get).toHaveBeenCalledTimes(1)
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.inventory.reservations, { params })
  })

  it('sends the exact reserve stock command', async () => {
    const response = { isSuccess: true, statusCode: 200, message: 'Success', data: null }
    vi.mocked(axiosClient.post).mockResolvedValue({ data: response })
    const request = {
      productId: 'product-1',
      warehouseId: 'warehouse-1',
      slotId: 'slot-1',
      quantity: 4,
    }

    await expect(inventoryService.reserveStock(request)).resolves.toEqual(response)
    expect(axiosClient.post).toHaveBeenCalledOnce()
    expect(axiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.inventory.reservations, request)
  })

  it('sends release quantity as the primitive delete body required by backend', async () => {
    const response = { isSuccess: true, statusCode: 200, message: 'Success', data: null }
    vi.mocked(axiosClient.delete).mockResolvedValue({ data: response })

    await expect(
      inventoryService.releaseReservation({ inventoryBalanceId: 'balance-1', quantity: 2.5 })
    ).resolves.toEqual(response)
    expect(axiosClient.delete).toHaveBeenCalledWith(
      `${API_ENDPOINTS.inventory.reservations}/balance-1`,
      { data: 2.5 }
    )
  })

  it('sends the exact damaged stock command', async () => {
    const response = { isSuccess: true, statusCode: 200, message: 'Success', data: 'adjustment-1' }
    vi.mocked(axiosClient.post).mockResolvedValue({ data: response })
    const request = {
      productId: 'product-1',
      warehouseId: 'warehouse-1',
      slotId: 'slot-1',
      quantity: 2,
      reason: 'Bao bì thấm nước',
    }

    await expect(inventoryService.reportDamagedStock(request)).resolves.toEqual(response)
    expect(axiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.inventory.damaged, request)
  })

  it('calls ABC classification once with the warehouse filter', async () => {
    const response = { isSuccess: true, statusCode: 200, message: 'Success', data: [] }
    vi.mocked(axiosClient.get).mockResolvedValue({ data: response })
    const params = { warehouseId: 'warehouse-1' }

    await expect(inventoryService.getAbcClassification(params)).resolves.toEqual(response)
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.inventory.abcClassification, {
      params,
    })
  })

  it('calls forecast once with the exact query', async () => {
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: {
        productId: 'product-1',
        warehouseId: null,
        modelName: 'linear-trend-baseline',
        forecast: [],
      },
    }
    vi.mocked(axiosClient.get).mockResolvedValue({ data: response })
    const params = { productId: 'product-1', horizonDays: 14 }

    await expect(inventoryService.getForecast(params)).resolves.toEqual(response)
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.inventory.forecast, { params })
  })

  it('calls stock history once with the exact query', async () => {
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: 'Success',
      data: { productId: 'product-1', warehouseId: null, history: [] },
    }
    vi.mocked(axiosClient.get).mockResolvedValue({ data: response })
    const params = { productId: 'product-1' }

    await expect(inventoryService.getStockHistory(params)).resolves.toEqual(response)
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.inventory.history, { params })
  })
})
