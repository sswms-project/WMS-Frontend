import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { subscriptionService } from '@/features/subscription/services/subscription.service'
import { APP_ROUTES } from '@/routes/app-routes'
import type { AuthUser } from '../types/auth.types'
import { resolvePostLoginRoute } from './post-login-route'

vi.mock('@/features/subscription/services/subscription.service', () => ({
  subscriptionService: { getCurrentSubscription: vi.fn() },
}))

const owner: AuthUser = {
  id: 'owner-id',
  tenantId: 'tenant-id',
  fullName: 'Owner',
  email: 'owner@example.com',
  role: USER_ROLES.TenantOwner,
  isActive: true,
}

const activeSubscription = {
  id: 'subscription-id',
  planName: 'Free',
  planPrice: 0,
  currency: 'VND',
  billingCycle: 'Monthly',
  startDate: '2026-09-21T00:00:00Z',
  endDate: null,
  status: 'Active',
  autoRenew: false,
  isExpired: false,
  daysRemaining: 0,
}

describe('resolvePostLoginRoute', () => {
  beforeEach(() => vi.mocked(subscriptionService.getCurrentSubscription).mockReset())

  it('routes an owner without a subscription to subscription selection', async () => {
    vi.mocked(subscriptionService.getCurrentSubscription).mockResolvedValue({
      isSuccess: true,
      statusCode: 200,
      message: '',
      data: null,
    })

    await expect(resolvePostLoginRoute(owner, APP_ROUTES.warehouses)).resolves.toBe(
      APP_ROUTES.subscription
    )
  })

  it('routes an owner with a Pending subscription to activation', async () => {
    vi.mocked(subscriptionService.getCurrentSubscription).mockResolvedValue({
      isSuccess: true,
      statusCode: 200,
      message: '',
      data: { ...activeSubscription, status: 'Pending' },
    })

    await expect(resolvePostLoginRoute(owner, APP_ROUTES.warehouses)).resolves.toBe(
      APP_ROUTES.subscription
    )
  })

  it('preserves the safe target for an owner with an effective subscription', async () => {
    vi.mocked(subscriptionService.getCurrentSubscription).mockResolvedValue({
      isSuccess: true,
      statusCode: 200,
      message: '',
      data: activeSubscription,
    })

    await expect(resolvePostLoginRoute(owner, APP_ROUTES.warehouses)).resolves.toBe(
      APP_ROUTES.warehouses
    )
  })

  it('does not call the billing endpoint for a warehouse employee', async () => {
    await expect(
      resolvePostLoginRoute({ ...owner, role: USER_ROLES.WarehouseStaff }, APP_ROUTES.inventory)
    ).resolves.toBe(APP_ROUTES.inventory)
    expect(subscriptionService.getCurrentSubscription).not.toHaveBeenCalled()
  })
})
