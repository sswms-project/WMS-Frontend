import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { describe, expect, it } from 'vitest'
import { axiosClient, shouldRedirectToUnauthorized } from './axios'

describe('shouldRedirectToUnauthorized', () => {
  it('does not send a hard-coded tenant header', () => {
    expect(axiosClient.defaults.headers['x-tenant-id']).toBeUndefined()
  })

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
