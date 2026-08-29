import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { shouldRedirectToUnauthorized } from './axios'

describe('shouldRedirectToUnauthorized', () => {
  it('does not redirect when the background subscription status request is forbidden', () => {
    expect(shouldRedirectToUnauthorized(API_ENDPOINTS.subscription.me)).toBe(false)
  })

  it('lets the tenant access-control page handle workspace and mutation forbidden states', () => {
    expect(shouldRedirectToUnauthorized(API_ENDPOINTS.tenantRolePermissions.workspace)).toBe(false)
    expect(
      shouldRedirectToUnauthorized(API_ENDPOINTS.tenantRolePermissions.assign('manager-role'))
    ).toBe(false)
  })

  it('redirects when a protected resource request is forbidden', () => {
    expect(shouldRedirectToUnauthorized(API_ENDPOINTS.warehouses.list)).toBe(true)
  })
})
