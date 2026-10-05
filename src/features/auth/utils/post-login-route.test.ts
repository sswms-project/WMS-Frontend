import { describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'
import type { AuthUser } from '../types/auth.types'
import { resolvePostLoginRoute } from './post-login-route'

vi.mock('@/features/subscription/services/subscription.service', () => ({
  subscriptionService: {},
}))

const staff: AuthUser = {
  id: 'staff',
  tenantId: 'tenant',
  fullName: 'Nhân viên',
  email: 'staff@example.test',
  role: USER_ROLES.WarehouseStaff,
  isActive: true,
}

describe('post login destination', () => {
  it('lands Staff on My Tasks', async () => {
    expect(await resolvePostLoginRoute(staff)).toBe(APP_ROUTES.myTasks)
  })
  it('preserves an explicit return URL', async () => {
    expect(await resolvePostLoginRoute(staff, APP_ROUTES.inboundRequests)).toBe(
      APP_ROUTES.inboundRequests
    )
  })
  it('keeps Manager on the dashboard', async () => {
    expect(await resolvePostLoginRoute({ ...staff, role: USER_ROLES.WarehouseManager })).toBe(
      APP_ROUTES.dashboard
    )
  })
})
