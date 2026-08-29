import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  getNavItems,
  getVisibleNavSections,
  isNavItemActive,
  isNavSectionActive,
  NAV_CONFIG,
} from './nav-config'

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

    expect(serviceSection?.label).toBe('Dịch vụ')
    expect(serviceSection?.items.map((item) => [item.label, item.href])).toEqual([
      ['Gói dịch vụ', APP_ROUTES.subscription],
      ['Lịch sử thanh toán', APP_ROUTES.subscriptionPayments],
    ])
  })

  it('uses the requested tenant sidebar hierarchy and order', () => {
    const tenantSections = NAV_CONFIG[USER_ROLES.TenantOwner]

    expect(
      tenantSections.map((section) => ({
        label: section.label ?? null,
        items: section.items.map((item) => item.label),
      }))
    ).toEqual([
      { label: null, items: ['Dashboard'] },
      { label: 'Quản trị tổ chức', items: ['Tổ chức', 'Nhân sự', 'Phân quyền'] },
      { label: null, items: ['Kho hàng'] },
      { label: 'Danh mục', items: ['Sản phẩm', 'Nhà cung cấp'] },
      {
        label: 'Vận hành kho',
        items: ['Mua hàng', 'Nhập kho', 'Tồn kho', 'Điều chuyển kho', 'Xuất kho & Giao hàng'],
      },
      {
        label: 'Báo cáo',
        items: ['Dashboard kho', 'Báo cáo vận hành', 'Dự báo & Bổ sung hàng'],
      },
      { label: 'Dịch vụ', items: ['Gói dịch vụ', 'Lịch sử thanh toán'] },
      { label: 'Hệ thống', items: ['Thông báo', 'Audit Log', 'Cài đặt'] },
    ])
  })

  it('keeps unfinished tenant destinations non-navigable', () => {
    const plannedItems = getNavItems(USER_ROLES.TenantOwner).filter(
      (item) => item.status === 'planned'
    )

    expect(plannedItems.map((item) => item.label)).toEqual([
      'Điều chuyển kho',
      'Xuất kho & Giao hàng',
      'Dashboard kho',
      'Báo cáo vận hành',
      'Dự báo & Bổ sung hàng',
      'Thông báo',
      'Audit Log',
    ])
    expect(plannedItems.every((item) => item.href === undefined)).toBe(true)
    expect(plannedItems.every((item) => !isNavItemActive('/anything', item))).toBe(true)
  })

  it('marks a tenant group active when one of its child routes is active', () => {
    const catalogSection = NAV_CONFIG[USER_ROLES.TenantOwner].find(
      (section) => section.id === 'catalog'
    )

    expect(catalogSection).toBeDefined()
    expect(isNavSectionActive('/products/product-1', catalogSection!)).toBe(true)
    expect(isNavSectionActive('/suppliers', catalogSection!)).toBe(true)
    expect(isNavSectionActive('/inventory', catalogSection!)).toBe(false)
  })

  it.each([
    [USER_ROLES.TenantOwner, APP_ROUTES.dashboardByRole.tenant],
    [USER_ROLES.WarehouseManager, APP_ROUTES.dashboardByRole.manager],
    [USER_ROLES.WarehouseStaff, APP_ROUTES.dashboardByRole.staff],
  ])('marks the redirected dashboard route active for %s', (role, pathname) => {
    const dashboardItem = getNavItems(role).find((item) => item.href === APP_ROUTES.dashboard)

    expect(dashboardItem).toBeDefined()
    expect(isNavItemActive(pathname, dashboardItem!)).toBe(true)
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
