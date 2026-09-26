'use client'

import { usePathname } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { APP_ROUTES } from '@/routes/app-routes'

const pageTitles: Array<{ prefix: string; label: string }> = [
  { prefix: APP_ROUTES.notifications, label: 'Thông báo' },
  { prefix: APP_ROUTES.auditLogs, label: 'Nhật ký hoạt động' },
  { prefix: APP_ROUTES.settings.accessControl, label: 'Phân quyền' },
  { prefix: APP_ROUTES.settings.security, label: 'Cài đặt' },
  { prefix: APP_ROUTES.organization, label: 'Tổ chức' },
  { prefix: APP_ROUTES.staff, label: 'Nhân sự' },
  { prefix: APP_ROUTES.admin.tenants, label: 'Quản lý đơn vị thuê' },
  { prefix: APP_ROUTES.admin.subscriptionPlans, label: 'Gói đăng ký' },
  { prefix: APP_ROUTES.admin.roles, label: 'Phân quyền' },
  { prefix: APP_ROUTES.dashboard, label: 'Dashboard' },
  { prefix: APP_ROUTES.subscriptionInvoices, label: 'Lịch sử thanh toán' },
  { prefix: APP_ROUTES.subscriptionPayments, label: 'Lịch sử thanh toán' },
  { prefix: APP_ROUTES.subscription, label: 'Gói dịch vụ' },
  { prefix: APP_ROUTES.warehouses, label: 'Kho hàng' },
  { prefix: APP_ROUTES.suppliers, label: 'Nhà cung cấp' },
  { prefix: APP_ROUTES.units, label: 'Đơn vị tính' },
  { prefix: APP_ROUTES.categories, label: 'Nhóm vật tư hàng hóa' },
  { prefix: APP_ROUTES.inboundRequests, label: 'Yêu cầu nhập kho' },
  { prefix: APP_ROUTES.inbound, label: 'Nhập kho' },
  { prefix: APP_ROUTES.inventory, label: 'Tồn kho' },
  { prefix: APP_ROUTES.products, label: 'Danh mục vật tư hàng hóa' },
  { prefix: APP_ROUTES.stockIssueRequests, label: 'Yêu cầu xuất kho' },
  { prefix: APP_ROUTES.goodsReturnRequests, label: 'Yêu cầu trả hàng' },
]

export function getPageTitle(pathname: string) {
  const match = pageTitles.find(
    (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`)
  )

  return match?.label ?? 'Dashboard'
}

export function PageHeading() {
  const pathname = usePathname()
  const showAccessControlIcon =
    pathname === APP_ROUTES.settings.accessControl ||
    pathname.startsWith(`${APP_ROUTES.settings.accessControl}/`)

  return (
    <div className="flex min-w-0 items-center gap-2">
      {showAccessControlIcon && <ShieldCheck className="text-primary size-4" aria-hidden="true" />}
      <h1 className="text-foreground truncate text-[15px] font-semibold">
        {getPageTitle(pathname)}
      </h1>
    </div>
  )
}
