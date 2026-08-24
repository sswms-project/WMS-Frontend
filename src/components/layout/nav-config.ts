import {
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  Settings,
  Shield,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { USER_ROLES, type UserRole } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'

export type NavItem = {
  readonly href: string
  readonly label: string
  readonly icon: LucideIcon
  readonly match?: 'exact' | 'prefix'
  readonly activePrefixes?: readonly string[]
}

export type NavSection = {
  readonly id: string
  readonly label?: string
  readonly items: readonly NavItem[]
}

export const NAV_CONFIG: Record<UserRole, readonly NavSection[]> = {
  [USER_ROLES.SystemAdmin]: [
    {
      id: 'workspace',
      items: [{ href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      id: 'administration',
      label: 'Quản trị',
      items: [
        { href: APP_ROUTES.admin.roles, label: 'Phân quyền', icon: Shield },
        {
          href: APP_ROUTES.admin.subscriptionPlans,
          label: 'Gói đăng ký',
          icon: CreditCard,
        },
      ],
    },
    {
      id: 'system',
      label: 'Hệ thống',
      items: [{ href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings }],
    },
  ],
  [USER_ROLES.TenantOwner]: [
    {
      id: 'workspace',
      items: [
        { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
        { href: APP_ROUTES.organization, label: 'Tổ chức', icon: Building2 },
        { href: APP_ROUTES.staff, label: 'Nhân sự', icon: Users },
        { href: APP_ROUTES.warehouses, label: 'Kho hàng', icon: Warehouse },
        { href: APP_ROUTES.purchaseOrders, label: 'Mua hàng', icon: ClipboardList },
        { href: APP_ROUTES.inbound, label: 'Nhập kho', icon: PackageCheck },
        { href: APP_ROUTES.inventory, label: 'Tồn kho', icon: PackageSearch },
        { href: APP_ROUTES.products, label: 'Sản phẩm', icon: Package },
      ],
    },
    {
      id: 'services',
      label: 'Quản lý dịch vụ',
      items: [
        {
          href: APP_ROUTES.subscription,
          label: 'Gói dịch vụ',
          icon: CreditCard,
          match: 'exact',
        },
        {
          href: APP_ROUTES.subscriptionPayments,
          label: 'Lịch sử thanh toán',
          icon: ReceiptText,
          activePrefixes: [APP_ROUTES.subscriptionInvoices],
        },
      ],
    },
    {
      id: 'system',
      label: 'Hệ thống',
      items: [{ href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings }],
    },
  ],
  [USER_ROLES.WarehouseManager]: [
    {
      id: 'workspace',
      items: [
        { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
        { href: APP_ROUTES.staff, label: 'Nhân sự', icon: Users },
        { href: APP_ROUTES.warehouses, label: 'Kho hàng', icon: Warehouse },
        { href: APP_ROUTES.purchaseOrders, label: 'Mua hàng', icon: ClipboardList },
        { href: APP_ROUTES.inbound, label: 'Nhập kho', icon: PackageCheck },
        { href: APP_ROUTES.inventory, label: 'Tồn kho', icon: PackageSearch },
      ],
    },
  ],
  [USER_ROLES.WarehouseStaff]: [
    {
      id: 'workspace',
      items: [
        { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
        { href: APP_ROUTES.warehouses, label: 'Kho hàng', icon: Warehouse },
        { href: APP_ROUTES.inbound, label: 'Nhập kho', icon: PackageCheck },
        { href: APP_ROUTES.inventory, label: 'Tồn kho', icon: PackageSearch },
      ],
    },
  ],
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href) return true
  if (item.match === 'exact') return false

  if (item.activePrefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return true
  }

  return item.href !== APP_ROUTES.dashboard && pathname.startsWith(`${item.href}/`)
}

export function getNavItems(role: UserRole): readonly NavItem[] {
  return NAV_CONFIG[role].flatMap((section) => section.items)
}
