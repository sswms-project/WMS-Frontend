'use client'

import { usePathname } from 'next/navigation'
import { APP_ROUTES } from '@/routes/app-routes'

const pageTitles: Array<{ prefix: string; label: string }> = [
  { prefix: APP_ROUTES.organization, label: 'Tổ chức' },
  { prefix: APP_ROUTES.staff, label: 'Nhân sự' },
  { prefix: APP_ROUTES.admin.subscriptionPlans, label: 'Gói đăng ký' },
  { prefix: APP_ROUTES.admin.roles, label: 'Phân quyền vai trò' },
  { prefix: APP_ROUTES.dashboard, label: 'Bảng điều khiển' },
  { prefix: APP_ROUTES.warehouses, label: 'Kho hàng' },
  { prefix: APP_ROUTES.purchaseOrders, label: 'Mua hàng' },
  { prefix: APP_ROUTES.inbound, label: 'Nhập kho' },
  { prefix: APP_ROUTES.inventory, label: 'Tồn kho' },
  { prefix: APP_ROUTES.orders, label: 'Đơn hàng' },
  { prefix: APP_ROUTES.delivery, label: 'Vận chuyển' },
]

export function PageHeading() {
  const pathname = usePathname()
  const match = pageTitles.find((item) => pathname.startsWith(item.prefix))

  return (
    <h1 className="text-foreground truncate text-[15px] font-semibold">
      {match?.label ?? 'Bảng điều khiển'}
    </h1>
  )
}
