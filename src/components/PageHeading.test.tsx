import { describe, expect, it } from 'vitest'
import { APP_ROUTES } from '@/routes/app-routes'
import { getPageTitle } from './PageHeading'

describe('getPageTitle', () => {
  it.each([
    [APP_ROUTES.settings.accessControl, 'Phân quyền'],
    [APP_ROUTES.settings.security, 'Cài đặt'],
    [APP_ROUTES.admin.roles, 'Phân quyền'],
    [APP_ROUTES.auditLogs, 'Nhật ký hoạt động'],
    [APP_ROUTES.admin.tenants, 'Quản lý đơn vị thuê'],
    [APP_ROUTES.dashboardByRole.tenant, 'Dashboard'],
    [APP_ROUTES.products, 'Danh mục vật tư hàng hóa'],
  ])('maps %s to the matching navigation label', (pathname, expectedLabel) => {
    expect(getPageTitle(pathname)).toBe(expectedLabel)
  })

  it('keeps the parent label for nested routes', () => {
    expect(getPageTitle(`${APP_ROUTES.settings.accessControl}/history`)).toBe('Phân quyền')
    expect(getPageTitle(APP_ROUTES.admin.tenantDetail('tenant-id'))).toBe('Quản lý đơn vị thuê')
  })

  it('uses the dashboard label for an unknown private route', () => {
    expect(getPageTitle('/unknown')).toBe('Dashboard')
  })
})
