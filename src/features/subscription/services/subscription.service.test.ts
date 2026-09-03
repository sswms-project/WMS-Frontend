import { beforeEach, describe, expect, it, vi } from 'vitest'
import { subscriptionService } from './subscription.service'

const axios = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('@/lib/axios', () => ({ axiosClient: axios }))

describe('subscriptionService PayOS contract', () => {
  beforeEach(() => {
    axios.post.mockReset()
  })

  it('uses the authenticated command endpoint to synchronize an order', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: 'Completed' }
    axios.post.mockResolvedValue({ data: response })

    await expect(subscriptionService.syncPaymentStatus('123456789')).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledWith('/subscriptions/payments/123456789/sync')
  })

  it('creates a PayOS checkout link for renewal instead of completing it directly', async () => {
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: '',
      data: {
        checkoutUrl: 'https://pay.payos.vn/test',
        paymentLinkId: 'link-id',
        orderCode: 123456789,
      },
    }
    axios.post.mockResolvedValue({ data: response })

    await expect(subscriptionService.renewSubscription()).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledWith('/subscriptions/renew')
  })
})
