import { beforeEach, describe, expect, it, vi } from 'vitest'
import { subscriptionService } from './subscription.service'

const axios = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))

vi.mock('@/lib/axios', () => ({ axiosClient: axios }))

describe('subscriptionService PayOS contract', () => {
  beforeEach(() => {
    axios.get.mockReset()
    axios.post.mockReset()
  })

  it('treats a missing current subscription as a successful onboarding state', async () => {
    const response = { isSuccess: true, statusCode: 200, message: '', data: null }
    axios.get.mockResolvedValue({ data: response })

    await expect(subscriptionService.getCurrentSubscription()).resolves.toEqual(response)

    expect(axios.get).toHaveBeenCalledWith('/subscriptions/me')
  })

  it('uses the canonical initial-selection endpoint with the chosen billing cycle', async () => {
    const body = { planId: 'plan-free', billingCycle: 'Monthly' as const }
    const response = {
      isSuccess: true,
      statusCode: 200,
      message: '',
      data: { subscriptionStatus: 'Active', requiresPayment: false },
    }
    axios.post.mockResolvedValue({ data: response })

    await expect(subscriptionService.selectInitialPlan(body)).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledWith('/subscriptions/initial-selection', body)
  })

  it('uses the canonical change-plan endpoint with explicit application timing', async () => {
    const body = {
      planId: 'plan-premium',
      billingCycle: 'Yearly' as const,
      applicationTiming: 'ApplyNextCycle' as const,
    }
    const response = { isSuccess: true, statusCode: 200, message: '', data: {} }
    axios.post.mockResolvedValue({ data: response })

    await expect(subscriptionService.changePlan(body)).resolves.toEqual(response)

    expect(axios.post).toHaveBeenCalledWith('/subscriptions/change-plan', body)
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
