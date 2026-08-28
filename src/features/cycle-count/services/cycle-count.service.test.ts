import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { cycleCountService } from './cycle-count.service'

vi.mock('@/lib/axios', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const response = { isSuccess: true, statusCode: 200, message: 'Success', data: null }

describe('cycleCountService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends the exact cycle count command', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: response })
    const request = {
      warehouseId: 'warehouse-1',
      zoneId: null,
      scheduledDate: '2026-08-25T10:00:00.000Z',
      assignedTo: 'staff-1',
      items: [{ productId: 'product-1', slotId: 'slot-1' }],
      isBlindCount: true,
    }
    await cycleCountService.createCycleCount(request)
    expect(axiosClient.post).toHaveBeenCalledOnce()
    expect(axiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.cycleCounts.create, request)
  })

  it('sends counted quantity as the primitive body required by backend', async () => {
    vi.mocked(axiosClient.put).mockResolvedValue({ data: response })
    await cycleCountService.recordCycleCountItem({
      cycleCountId: 'count-1',
      itemId: 'item-1',
      countedQuantity: 12.5,
    })
    expect(axiosClient.put).toHaveBeenCalledWith(
      API_ENDPOINTS.cycleCounts.recordItem('count-1', 'item-1'),
      12.5
    )
  })

  it('creates adjustment from a count item without client-calculated quantity', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: response })
    const request = { cycleCountItemId: 'item-1', reason: 'Chênh lệch đã xác minh' }
    await cycleCountService.createStockAdjustment(request)
    expect(axiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.stockAdjustments.create, request)
  })
})
