import { describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { deliveryService } from './delivery.service'

vi.mock('@/lib/axios', () => ({ axiosClient: { get: vi.fn(), post: vi.fn() } }))

describe('deliveryService', () => {
  it('uses server filters and exact status command', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: null } })
    vi.mocked(axiosClient.post).mockResolvedValue({ data: { data: null } })
    const params = { pageNumber: 2, pageSize: 10, status: 'Shipping' as const }
    const request = { newStatus: 'Failed' as const, note: 'Không liên lạc được' }
    await deliveryService.getDeliveries(params)
    await deliveryService.updateDeliveryStatus('order', request)
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.deliveries.list, { params })
    expect(axiosClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.deliveries.updateStatus('order'),
      request
    )
  })
})
