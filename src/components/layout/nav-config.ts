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
  ShieldCheck,
  Truck,
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
  readonly requiredPermission?: string
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
      items: [
        {
          href: APP_ROUTES.dashboard,
          label: 'Dashboard',
          icon: LayoutDashboard,
          requiredPermission: 'admin:dashboard:view',
        },
      ],
    },
    {
      id: 'administration',
      label: 'Quản trị',
      items: [
        {
          href: APP_ROUTES.admin.roles,
          label: 'Phân quyền',
          icon: Shield,
          requiredPermission: 'roles:view',
        },
        {
          href: APP_ROUTES.admin.subscriptionPlans,
          label: 'Gói đăng ký',
          icon: CreditCard,
          requiredPermission: 'subscription-plans:view',
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
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, 'dashboard:view'),
        requiredNavItem(APP_ROUTES.organization, 'Tổ chức', Building2, 'organization:view'),
        requiredNavItem(APP_ROUTES.staff, 'Nhân sự', Users, 'staff:view'),
        requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, 'warehouses:view'),
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, 'suppliers:view'),
        requiredNavItem(
          APP_ROUTES.purchaseOrders,
          'Mua hàng',
          ClipboardList,
          'purchase-orders:view'
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, 'inbound-receipts:view'),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, 'inventory:view'),
        requiredNavItem(APP_ROUTES.products, 'Sản phẩm', Package, 'products:view'),
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
          requiredPermission: 'subscriptions:view',
          match: 'exact',
        },
        {
          href: APP_ROUTES.subscriptionPayments,
          label: 'Lịch sử thanh toán',
          icon: ReceiptText,
          requiredPermission: 'subscription-plans:view',
          activePrefixes: [APP_ROUTES.subscriptionInvoices],
        },
      ],
    },
    {
      id: 'system',
      label: 'Hệ thống',
      items: [
        {
          href: APP_ROUTES.settings.accessControl,
          label: 'Phân quyền',
          icon: ShieldCheck,
          requiredPermission: 'tenant-role-permissions:view',
        },
        { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
      ],
    },
  ],
  [USER_ROLES.WarehouseManager]: [
    {
      id: 'workspace',
      items: [
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, 'dashboard:view'),
        requiredNavItem(APP_ROUTES.staff, 'Nhân sự', Users, 'staff:view'),
        requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, 'warehouses:view'),
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, 'suppliers:view'),
        requiredNavItem(
          APP_ROUTES.purchaseOrders,
          'Mua hàng',
          ClipboardList,
          'purchase-orders:view'
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, 'inbound-receipts:view'),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, 'inventory:view'),
        requiredNavItem(APP_ROUTES.products, 'Sản phẩm', Package, 'products:view'),
      ],
    },
  ],
  [USER_ROLES.WarehouseStaff]: [
    {
      id: 'workspace',
      items: [
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, 'dashboard:view'),
        requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, 'warehouses:view'),
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, 'suppliers:view'),
        requiredNavItem(
          APP_ROUTES.purchaseOrders,
          'Mua hàng',
          ClipboardList,
          'purchase-orders:view'
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, 'inbound-receipts:view'),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, 'inventory:view'),
        requiredNavItem(APP_ROUTES.products, 'Sản phẩm', Package, 'products:view'),
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

export function getVisibleNavSections(
  role: UserRole,
  permissions: ReadonlySet<string>
): readonly NavSection[] {
  return NAV_CONFIG[role]
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.requiredPermission || permissions.has(item.requiredPermission)
      ),
    }))
    .filter((section) => section.items.length > 0)
}

function requiredNavItem(
  href: string,
  label: string,
  icon: LucideIcon,
  requiredPermission: string
): NavItem {
  return { href, label, icon, requiredPermission }
}
