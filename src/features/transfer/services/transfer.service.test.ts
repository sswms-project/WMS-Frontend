import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { transferService } from './transfer.service'

vi.mock('@/lib/axios', () => ({ axiosClient: { get: vi.fn(), post: vi.fn() } }))
const response = { data: { isSuccess: true, statusCode: 200, message: 'OK', data: null } }

describe('transferService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axiosClient.get).mockResolvedValue(response)
    vi.mocked(axiosClient.post).mockResolvedValue(response)
  })
  it('serializes server filters and detail URL', async () => {
    const params = { pageNumber: 1, pageSize: 10, searchTerm: 'TR', dateFrom: '2026-01-01' }
    await transferService.getTransfers(params)
    await transferService.getTransfer('id')
    expect(axiosClient.get).toHaveBeenNthCalledWith(1, API_ENDPOINTS.transfers.list, { params })
    expect(axiosClient.get).toHaveBeenNthCalledWith(2, API_ENDPOINTS.transfers.detail('id'))
  })
  it('sends approve and receive payloads unchanged', async () => {
    const approve = { note: 'ok', items: [{ stockTransferItemId: 'line', approvedQuantity: 2 }] }
    const receive = {
      items: [
        {
          stockTransferItemId: 'line',
          receivedQuantity: 1,
          damagedQuantity: 1,
          missingQuantity: 0,
        },
      ],
    }
    await transferService.approveTransfer('id', approve)
    await transferService.receiveTransfer('id', receive)
    expect(axiosClient.post).toHaveBeenNthCalledWith(
      1,
      API_ENDPOINTS.transfers.approve('id'),
      approve
    )
    expect(axiosClient.post).toHaveBeenNthCalledWith(
      2,
      API_ENDPOINTS.transfers.receive('id'),
      receive
    )
  })
})
