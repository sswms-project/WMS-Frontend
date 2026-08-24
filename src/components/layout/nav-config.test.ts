import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'
import { NAV_CONFIG } from './nav-config'

describe('warehouse navigation visibility', () => {
  it.each([USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff])(
    'shows the warehouse workspace for %s',
    (role) => {
      expect(NAV_CONFIG[role].some((item) => item.href === APP_ROUTES.warehouses)).toBe(true)
    }
  )

  it('keeps tenant warehouse navigation hidden from the system admin', () => {
    expect(
      NAV_CONFIG[USER_ROLES.SystemAdmin].some((item) => item.href === APP_ROUTES.warehouses)
    ).toBe(false)
  })

  it('shows purchasing to owner and manager, and inbound to every tenant warehouse role', () => {
    expect(
      NAV_CONFIG[USER_ROLES.TenantOwner].some((item) => item.href === APP_ROUTES.purchaseOrders)
    ).toBe(true)
    expect(
      NAV_CONFIG[USER_ROLES.WarehouseManager].some(
        (item) => item.href === APP_ROUTES.purchaseOrders
      )
    ).toBe(true)
    expect(
      NAV_CONFIG[USER_ROLES.WarehouseStaff].some((item) => item.href === APP_ROUTES.purchaseOrders)
    ).toBe(false)

    for (const role of [
      USER_ROLES.TenantOwner,
      USER_ROLES.WarehouseManager,
      USER_ROLES.WarehouseStaff,
    ]) {
      expect(NAV_CONFIG[role].some((item) => item.href === APP_ROUTES.inbound)).toBe(true)
    }
  })
})
