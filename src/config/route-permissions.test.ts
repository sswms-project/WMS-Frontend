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

  it('allows every tenant role to open delegated access control', () => {
    const roles = getAllowedRolesForPath(APP_ROUTES.settings.accessControl)

    expect(roles).toEqual([
      USER_ROLES.TenantOwner,
      USER_ROLES.WarehouseManager,
      USER_ROLES.WarehouseStaff,
    ])
  })

  it('allows managers and staff to open their warehouse task workspace', () => {
    expect(getAllowedRolesForPath(APP_ROUTES.myTasks)).toEqual([
      USER_ROLES.WarehouseManager,
      USER_ROLES.WarehouseStaff,
    ])
    expect(getAllowedRolesForPath(APP_ROUTES.myTaskHistory)).toEqual([
      USER_ROLES.WarehouseManager,
      USER_ROLES.WarehouseStaff,
    ])
  })
})
