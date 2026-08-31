import type { Route } from 'next'
import {
  ArrowLeftRight,
  Bell,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  FileChartColumn,
  FolderCog,
  LayoutDashboard,
  Package,
  PackageCheck,
  PackageMinus,
  PackageOpen,
  PackageSearch,
  ReceiptText,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Tags,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { USER_ROLES, type UserRole } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'

export type NavItem = {
  readonly href?: Route
  readonly label: string
  readonly icon: LucideIcon
  readonly requiredPermission?: string
  readonly match?: 'exact' | 'prefix'
  readonly activePrefixes?: readonly string[]
  readonly status?: 'planned'
}

export type NavSection = {
  readonly id: string
  readonly label?: string
  readonly icon?: LucideIcon
  readonly items: readonly NavItem[]
  readonly collapsible?: boolean
  readonly separatorBefore?: boolean
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
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, 'dashboard:view', [
          APP_ROUTES.dashboardByRole.tenant,
        ]),
      ],
    },
    {
      id: 'organization-management',
      label: 'Quản trị tổ chức',
      icon: Building2,
      collapsible: true,
      items: [
        requiredNavItem(APP_ROUTES.organization, 'Tổ chức', Building2, 'organization:view'),
        requiredNavItem(APP_ROUTES.staff, 'Nhân sự', Users, 'staff:view'),
        requiredNavItem(
          APP_ROUTES.settings.accessControl,
          'Phân quyền',
          ShieldCheck,
          'tenant-role-permissions:view'
        ),
      ],
    },
    {
      id: 'warehouses',
      separatorBefore: true,
      items: [requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, 'warehouses:view')],
    },
    {
      id: 'catalog',
      label: 'Danh mục',
      icon: Tags,
      collapsible: true,
      separatorBefore: true,
      items: [
        requiredNavItem(APP_ROUTES.products, 'Sản phẩm', Package, 'products:view'),
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, 'suppliers:view'),
        requiredNavItem(APP_ROUTES.customers, 'Khách hàng', Users, 'customers:view'),
      ],
    },
    {
      id: 'warehouse-operations',
      label: 'Vận hành kho',
      icon: PackageOpen,
      collapsible: true,
      separatorBefore: true,
      items: [
        requiredNavItem(
          APP_ROUTES.purchaseOrders,
          'Mua hàng',
          ClipboardList,
          'purchase-orders:view'
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, 'inbound-receipts:view'),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, 'inventory:view'),
        requiredNavItem(APP_ROUTES.transfers, 'Điều chuyển kho', ArrowLeftRight, 'transfers:view'),
        requiredNavItem(
          APP_ROUTES.orders,
          'Xuất kho & Giao hàng',
          PackageMinus,
          'outbound-orders:view',
          [APP_ROUTES.returns, APP_ROUTES.delivery]
        ),
      ],
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: ChartNoAxesCombined,
      collapsible: true,
      separatorBefore: true,
      items: [
        plannedNavItem('Dashboard kho', ChartNoAxesCombined),
        plannedNavItem('Báo cáo vận hành', FileChartColumn),
        requiredNavItem(
          APP_ROUTES.inventoryForecast,
          'Dự báo & Bổ sung hàng',
          TrendingUp,
          'inventory:view'
        ),
      ],
    },
    {
      id: 'services',
      label: 'Dịch vụ',
      icon: FolderCog,
      collapsible: true,
      separatorBefore: true,
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
      icon: Settings,
      collapsible: true,
      separatorBefore: true,
      items: [
        plannedNavItem('Thông báo', Bell),
        plannedNavItem('Audit Log', ScrollText),
        { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
      ],
    },
  ],
  [USER_ROLES.WarehouseManager]: [
    {
      id: 'workspace',
      items: [
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, 'dashboard:view', [
          APP_ROUTES.dashboardByRole.manager,
        ]),
        requiredNavItem(APP_ROUTES.staff, 'Nhân sự', Users, 'staff:view'),
        requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, 'warehouses:view'),
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, 'suppliers:view'),
        requiredNavItem(APP_ROUTES.customers, 'Khách hàng', Users, 'customers:view'),
        requiredNavItem(
          APP_ROUTES.purchaseOrders,
          'Mua hàng',
          ClipboardList,
          'purchase-orders:view'
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, 'inbound-receipts:view'),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, 'inventory:view'),
        requiredNavItem(APP_ROUTES.transfers, 'Điều chuyển kho', ArrowLeftRight, 'transfers:view'),
        requiredNavItem(
          APP_ROUTES.orders,
          'Xuất kho & Giao hàng',
          PackageMinus,
          'outbound-orders:view',
          [APP_ROUTES.returns, APP_ROUTES.delivery]
        ),
        requiredNavItem(APP_ROUTES.products, 'Sản phẩm', Package, 'products:view'),
      ],
    },
  ],
  [USER_ROLES.WarehouseStaff]: [
    {
      id: 'workspace',
      items: [
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, 'dashboard:view', [
          APP_ROUTES.dashboardByRole.staff,
        ]),
        requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, 'warehouses:view'),
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, 'suppliers:view'),
        requiredNavItem(APP_ROUTES.customers, 'Khách hàng', Users, 'customers:view'),
        requiredNavItem(
          APP_ROUTES.purchaseOrders,
          'Mua hàng',
          ClipboardList,
          'purchase-orders:view'
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, 'inbound-receipts:view'),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, 'inventory:view'),
        requiredNavItem(APP_ROUTES.transfers, 'Điều chuyển kho', ArrowLeftRight, 'transfers:view'),
        requiredNavItem(
          APP_ROUTES.orders,
          'Xuất kho & Giao hàng',
          PackageMinus,
          'outbound-orders:view',
          [APP_ROUTES.returns, APP_ROUTES.delivery]
        ),
        requiredNavItem(APP_ROUTES.products, 'Sản phẩm', Package, 'products:view'),
      ],
    },
  ],
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (!item.href || item.status === 'planned') return false
  if (pathname === item.href) return true
  if (item.match === 'exact') return false

  if (item.activePrefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return true
  }

  return item.href !== APP_ROUTES.dashboard && pathname.startsWith(`${item.href}/`)
}

export function isNavSectionActive(pathname: string, section: NavSection): boolean {
  return section.items.some((item) => isNavItemActive(pathname, item))
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
  href: Route,
  label: string,
  icon: LucideIcon,
  requiredPermission: string,
  activePrefixes?: readonly string[]
): NavItem {
  return { href, label, icon, requiredPermission, activePrefixes }
}

function plannedNavItem(label: string, icon: LucideIcon): NavItem {
  return { label, icon, status: 'planned' }
}
