import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'
import { getNavItems, getVisibleNavSections, isNavItemActive, NAV_CONFIG } from './nav-config'

function getVisibleNavItems(
  role: Parameters<typeof getVisibleNavSections>[0],
  permissions: string[]
) {
  return getVisibleNavSections(role, new Set(permissions)).flatMap((section) => section.items)
}

describe('application navigation visibility', () => {
  it.each([USER_ROLES.TenantOwner, USER_ROLES.WarehouseManager, USER_ROLES.WarehouseStaff])(
    'shows the warehouse workspace for %s',
    (role) => {
      expect(getNavItems(role).some((item) => item.href === APP_ROUTES.warehouses)).toBe(true)
    }
  )

  it('keeps tenant warehouse navigation hidden from the system admin', () => {
    expect(
      getNavItems(USER_ROLES.SystemAdmin).some((item) => item.href === APP_ROUTES.warehouses)
    ).toBe(false)
  })

  it('shows permission-gated workspaces only when the current user has access', () => {
    expect(
      getVisibleNavItems(USER_ROLES.TenantOwner, ['purchase-orders:view']).some(
        (item) => item.href === APP_ROUTES.purchaseOrders
      )
    ).toBe(true)
    expect(
      getVisibleNavItems(USER_ROLES.WarehouseManager, ['purchase-orders:view']).some(
        (item) => item.href === APP_ROUTES.purchaseOrders
      )
    ).toBe(true)
    expect(
      getVisibleNavItems(USER_ROLES.WarehouseStaff, ['purchase-orders:view']).some(
        (item) => item.href === APP_ROUTES.purchaseOrders
      )
    ).toBe(true)
    expect(
      getVisibleNavItems(USER_ROLES.WarehouseStaff, []).some(
        (item) => item.href === APP_ROUTES.purchaseOrders
      )
    ).toBe(false)

    const staffItems = getVisibleNavItems(USER_ROLES.WarehouseStaff, [
      'suppliers:view',
      'products:view',
      'inbound-receipts:view',
      'inventory:view',
    ])
    expect(staffItems.some((item) => item.href === APP_ROUTES.suppliers)).toBe(true)
    expect(staffItems.some((item) => item.href === APP_ROUTES.products)).toBe(true)
    expect(staffItems.some((item) => item.href === APP_ROUTES.inbound)).toBe(true)
    expect(staffItems.some((item) => item.href === APP_ROUTES.inventory)).toBe(true)
  })

  it('groups subscription management without duplicate payment entries', () => {
    const serviceSection = NAV_CONFIG[USER_ROLES.TenantOwner].find(
      (section) => section.id === 'services'
    )

    expect(serviceSection?.label).toBe('Quản lý dịch vụ')
    expect(serviceSection?.items.map((item) => [item.label, item.href])).toEqual([
      ['Gói dịch vụ', APP_ROUTES.subscription],
      ['Lịch sử thanh toán', APP_ROUTES.subscriptionPayments],
    ])
  })

  it('marks only the correct subscription navigation item as active', () => {
    const serviceItems = NAV_CONFIG[USER_ROLES.TenantOwner].find(
      (section) => section.id === 'services'
    )?.items
    const planItem = serviceItems?.find((item) => item.href === APP_ROUTES.subscription)
    const paymentsItem = serviceItems?.find((item) => item.href === APP_ROUTES.subscriptionPayments)

    expect(planItem).toBeDefined()
    expect(paymentsItem).toBeDefined()
    expect(isNavItemActive('/subscription', planItem!)).toBe(true)
    expect(isNavItemActive('/subscription/payments', planItem!)).toBe(false)
    expect(isNavItemActive('/subscription/payments', paymentsItem!)).toBe(true)
    expect(isNavItemActive('/subscription/invoices/payment-1/print', paymentsItem!)).toBe(true)
  })

  it('keeps tenant inventory hidden from the system admin', () => {
    expect(
      getNavItems(USER_ROLES.SystemAdmin).some((item) => item.href === APP_ROUTES.inventory)
    ).toBe(false)
  })

  it('shows tenant access control only to the tenant owner', () => {
    expect(
      getNavItems(USER_ROLES.TenantOwner).some(
        (item) => item.href === APP_ROUTES.settings.accessControl
      )
    ).toBe(true)

    for (const role of [
      USER_ROLES.SystemAdmin,
      USER_ROLES.WarehouseManager,
      USER_ROLES.WarehouseStaff,
    ]) {
      expect(
        getNavItems(role).some((item) => item.href === APP_ROUTES.settings.accessControl)
      ).toBe(false)
    }
  })
})
