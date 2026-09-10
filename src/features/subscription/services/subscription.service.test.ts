import { beforeEach, describe, expect, it, vi } from 'vitest'
import { subscriptionService } from './subscription.service'

const axios = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('@/lib/axios', () => ({ axiosClient: axios }))

describe('subscriptionService VNPay contract', () => {
  beforeEach(() => {
    axios.post.mockReset()
  })

  it('creates a VNPay checkout link for renewal instead of completing it directly', async () => {
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: '',
      data: {
        checkoutUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?test',
        paymentLinkId: 'txn-ref',
        orderCode: 123456789,
      },
    }
    axios.post.mockResolvedValue({ data: response })

    await expect(subscriptionService.renewSubscription()).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledWith('/subscriptions/renew')
  })
})
