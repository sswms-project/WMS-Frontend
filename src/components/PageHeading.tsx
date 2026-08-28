'use client'

import { usePathname } from 'next/navigation'
import { APP_ROUTES } from '@/routes/app-routes'

const pageTitles: Array<{ prefix: string; label: string }> = [
  { prefix: APP_ROUTES.settings.accessControl, label: 'Phân quyền' },
  { prefix: APP_ROUTES.settings.security, label: 'Cài đặt' },
  { prefix: APP_ROUTES.organization, label: 'Tổ chức' },
  { prefix: APP_ROUTES.staff, label: 'Nhân sự' },
  { prefix: APP_ROUTES.admin.subscriptionPlans, label: 'Gói đăng ký' },
  { prefix: APP_ROUTES.admin.roles, label: 'Phân quyền' },
  { prefix: APP_ROUTES.dashboard, label: 'Dashboard' },
  { prefix: APP_ROUTES.subscriptionInvoices, label: 'Lịch sử thanh toán' },
  { prefix: APP_ROUTES.subscriptionPayments, label: 'Lịch sử thanh toán' },
  { prefix: APP_ROUTES.subscription, label: 'Gói dịch vụ' },
  { prefix: APP_ROUTES.warehouses, label: 'Kho hàng' },
  { prefix: APP_ROUTES.suppliers, label: 'Nhà cung cấp' },
  { prefix: APP_ROUTES.purchaseOrders, label: 'Mua hàng' },
  { prefix: APP_ROUTES.inbound, label: 'Nhập kho' },
  { prefix: APP_ROUTES.inventory, label: 'Tồn kho' },
  { prefix: APP_ROUTES.products, label: 'Sản phẩm' },
  { prefix: APP_ROUTES.orders, label: 'Đơn hàng' },
  { prefix: APP_ROUTES.delivery, label: 'Vận chuyển' },
]

export function getPageTitle(pathname: string) {
  const match = pageTitles.find(
    (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`)
  )

  return match?.label ?? 'Dashboard'
}

export function PageHeading() {
  const pathname = usePathname()

  return (
    <h1 className="text-foreground truncate text-[15px] font-semibold">{getPageTitle(pathname)}</h1>
  )
}
