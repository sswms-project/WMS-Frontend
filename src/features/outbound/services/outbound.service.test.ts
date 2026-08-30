import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { outboundService } from './outbound.service'

vi.mock('@/lib/axios', () => ({ axiosClient: { get: vi.fn(), post: vi.fn() } }))
const response = { data: { isSuccess: true, statusCode: 200, message: 'OK', data: null } }

describe('outboundService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axiosClient.get).mockResolvedValue(response)
    vi.mocked(axiosClient.post).mockResolvedValue(response)
  })
  it('uses detail and filtered list endpoints', async () => {
    const params = { pageNumber: 1, pageSize: 10, customerId: 'customer', dateTo: '2026-01-31' }
    await outboundService.getOutboundOrders(params)
    await outboundService.getOutboundOrder('id')
    expect(axiosClient.get).toHaveBeenNthCalledWith(1, API_ENDPOINTS.outboundOrders.list, {
      params,
    })
    expect(axiosClient.get).toHaveBeenNthCalledWith(2, API_ENDPOINTS.outboundOrders.detail('id'))
  })
  it('sends issue and return commands unchanged', async () => {
    const issue = {
      items: [{ outboundOrderItemId: 'line', sourceSlotId: 'slot', pickedQuantity: 2 }],
    }
    const returned = {
      reason: 'reason',
      items: [{ productId: 'p', quantity: 1, condition: 'Good' as const, restockSlotId: 'slot' }],
    }
    await outboundService.issueStock('id', issue)
    await outboundService.recordReturn('id', returned)
    expect(axiosClient.post).toHaveBeenNthCalledWith(
      1,
      API_ENDPOINTS.outboundOrders.issue('id'),
      issue
    )
    expect(axiosClient.post).toHaveBeenNthCalledWith(
      2,
      API_ENDPOINTS.outboundOrders.returns('id'),
      returned
    )
  })
})
