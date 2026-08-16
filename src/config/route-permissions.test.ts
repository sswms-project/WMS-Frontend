import { describe, expect, it } from 'vitest'
import { APP_ROUTES } from '@/routes/app-routes'
import { getAllowedRolesForPath } from './route-permissions'
import { USER_ROLES } from './roles'

describe('warehouse route permission', () => {
  it('allows warehouse tenant roles to access list, detail, and layout routes', () => {
    const warehouseRoles = [
      USER_ROLES.TenantOwner,
      USER_ROLES.WarehouseManager,
      USER_ROLES.WarehouseStaff,
    ]

    expect(getAllowedRolesForPath('/warehouses')).toEqual(warehouseRoles)
    expect(getAllowedRolesForPath('/warehouses/497f6eca-6276-4993-bfeb-53cbbbba6f08')).toEqual(
      warehouseRoles
    )
    expect(
      getAllowedRolesForPath('/warehouses/497f6eca-6276-4993-bfeb-53cbbbba6f08/layout')
    ).toEqual(warehouseRoles)
  })

  it('builds stable warehouse overview and layout routes', () => {
    const warehouseId = '497f6eca-6276-4993-bfeb-53cbbbba6f08'

    expect(APP_ROUTES.warehouseDetail(warehouseId)).toBe(`/warehouses/${warehouseId}`)
    expect(APP_ROUTES.warehouseLayout(warehouseId)).toBe(`/warehouses/${warehouseId}/layout`)
  })
})
