import { describe, expect, it } from 'vitest'
import { APP_ROUTES } from '@/routes/app-routes'
import { getNotificationReferenceRoute, notificationActionRoutes } from './platform-services-format'

const id = '11111111-1111-4111-8111-111111111111'

describe('getNotificationReferenceRoute', () => {
  it('routes tenant approval notifications to the subscription page', () => {
    expect(
      getNotificationReferenceRoute({
        type: 'TenantStatusUpdate',
        referenceType: 'TenantSubscription',
        referenceId: id,
      })
    ).toBe(APP_ROUTES.subscription)
  })

  it('returns null without a reference', () => {
    expect(
      getNotificationReferenceRoute({
        type: 'TenantStatusUpdate',
        referenceType: null,
        referenceId: null,
      })
    ).toBeNull()
  })

  it('prefers the action over the reference type', () => {
    expect(
      getNotificationReferenceRoute({
        type: 'TenantStatusUpdate',
        referenceType: 'Tenant',
        referenceId: id,
        action: 'ChooseSubscriptionPlan',
      })
    ).toBe(APP_ROUTES.subscription)
  })

  it('falls back to the reference type for unknown actions', () => {
    expect(
      getNotificationReferenceRoute({
        type: 'TenantStatusUpdate',
        referenceType: 'Tenant',
        referenceId: id,
        action: 'SomethingNew',
      })
    ).toBe(APP_ROUTES.organization)
  })

  it('routes every known action', () => {
    for (const [action, route] of Object.entries(notificationActionRoutes)) {
      expect(route.to(id), action).toBeTruthy()
    }
  })
})
