import { describe, expect, it } from 'vitest'
import { APP_ROUTES } from '@/routes/app-routes'
import { getAllowedRolesForPath } from './route-permissions'
import { USER_ROLES } from './roles'

describe('tenant route boundaries', () => {
  it.each([APP_ROUTES.auditLogs, APP_ROUTES.staff])(
    'allows every tenant operational role to open delegated route %s',
    (path) => {
      const roles = getAllowedRolesForPath(path)

      expect(roles).toEqual(
        expect.arrayContaining([
          USER_ROLES.TenantOwner,
          USER_ROLES.WarehouseManager,
          USER_ROLES.WarehouseStaff,
        ])
      )
    }
  )

  it('keeps owner-only access-control outside manager and staff routes', () => {
    const roles = getAllowedRolesForPath(APP_ROUTES.settings.accessControl)

    expect(roles).toEqual([USER_ROLES.TenantOwner])
  })
})
