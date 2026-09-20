import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { stockIssueService } from './stock-issue.service'

vi.mock('@/lib/axios', () => ({ axiosClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }))
const response = { data: { isSuccess: true, statusCode: 200, message: 'OK', data: null } }

describe('stockIssueService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axiosClient.get).mockResolvedValue(response)
    vi.mocked(axiosClient.post).mockResolvedValue(response)
    vi.mocked(axiosClient.delete).mockResolvedValue(response)
  })
  it('uses detail and filtered list endpoints', async () => {
    const params = {
      pageNumber: 1,
      pageSize: 10,
      stockRecipientId: 'stockRecipient',
      dateTo: '2026-01-31',
    }
    await stockIssueService.getStockIssueRequests(params)
    await stockIssueService.getStockIssueRequest('id')
    expect(axiosClient.get).toHaveBeenNthCalledWith(1, API_ENDPOINTS.stockIssueRequests.list, {
      params,
    })
    expect(axiosClient.get).toHaveBeenNthCalledWith(
      2,
      API_ENDPOINTS.stockIssueRequests.detail('id')
    )
  })
  it('sends issue and return commands unchanged', async () => {
    const issue = {
      items: [{ stockIssueRequestItemId: 'line', inventoryStockId: 'stock', pickedQuantity: 2 }],
    }
    const returned = {
      reason: 'reason',
      items: [
        {
          stockIssuePickDetailId: 'pick',
          quantity: 1,
          condition: 'Good' as const,
          restockSlotId: 'slot',
        },
      ],
    }
    await stockIssueService.recordStockPicking('id', issue)
    await stockIssueService.createGoodsReturnRequest('id', returned)
    expect(axiosClient.post).toHaveBeenNthCalledWith(
      1,
      API_ENDPOINTS.stockIssueRequests.picks('id'),
      issue
    )
    expect(axiosClient.post).toHaveBeenNthCalledWith(
      2,
      API_ENDPOINTS.stockIssueRequests.goodsReturnRequests('id'),
      returned
    )
  })
  it('removes an unissued pick detail through its document endpoint', async () => {
    await stockIssueService.removePickDetail('order', 'pick')
    expect(axiosClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.stockIssueRequests.removePickDetail('order', 'pick')
    )
  })

  it('confirms physical dispatch through the stock issue endpoint', async () => {
    await stockIssueService.confirmDispatch('request-1')
    expect(axiosClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.stockIssueRequests.dispatch('request-1')
    )
  })
})
