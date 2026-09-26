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
  Scale,
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
import { P } from '@/config/permissionCodes'
import { USER_ROLES, type UserRole } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'

export type NavItem = {
  readonly href?: string
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
          href: APP_ROUTES.admin.dashboard,
          label: 'Tổng quan',
          icon: LayoutDashboard,
          requiredPermission: P.ADMIN_DASHBOARD_VIEW,
        },
      ],
    },
    {
      id: 'administration',
      label: 'Quản trị nền tảng',
      items: [
        {
          href: APP_ROUTES.admin.tenants,
          label: 'Đơn vị thuê',
          icon: Building2,
          requiredPermission: P.ADMIN_TENANTS_VIEW,
        },
        {
          href: APP_ROUTES.admin.roles,
          label: 'Phân quyền',
          icon: Shield,
          requiredPermission: P.ROLES_VIEW,
        },
        {
          href: APP_ROUTES.admin.subscriptionPlans,
          label: 'Gói đăng ký',
          icon: CreditCard,
          requiredPermission: P.SUBSCRIPTION_PLANS_VIEW,
        },
      ],
    },
    {
      id: 'system',
      label: 'Hệ thống',
      items: [
        requiredNavItem(APP_ROUTES.auditLogs, 'Nhật ký hoạt động', ScrollText, P.AUDIT_LOGS_VIEW),
        { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
      ],
    },
  ],
  [USER_ROLES.TenantOwner]: [
    {
      id: 'workspace',
      items: [
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, P.DASHBOARD_VIEW, [
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
        requiredNavItem(APP_ROUTES.organization, 'Tổ chức', Building2, P.ORGANIZATION_VIEW),
        requiredNavItem(
          APP_ROUTES.settings.accessControl,
          'Phân quyền',
          ShieldCheck,
          P.TENANT_ROLE_PERMISSIONS_VIEW
        ),
        requiredNavItem(APP_ROUTES.staff, 'Nhân viên', Users, P.STAFF_VIEW),
      ],
    },
    {
      id: 'warehouse-management',
      label: 'Quản Lý Kho',
      icon: Warehouse,
      collapsible: true,
      separatorBefore: true,
      items: [requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, P.WAREHOUSES_VIEW)],
    },
    {
      id: 'subjects',
      label: 'Đối tượng',
      icon: Users,
      collapsible: true,
      separatorBefore: true,
      items: [
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, P.SUPPLIERS_VIEW),
        requiredNavItem(APP_ROUTES.stockRecipients, 'Khách hàng', Users, P.STOCK_RECIPIENTS_VIEW),
      ],
    },
    {
      id: 'catalog',
      label: 'Danh mục',
      icon: Tags,
      collapsible: true,
      separatorBefore: true,
      items: [
        requiredNavItem(APP_ROUTES.products, 'Danh mục VTHH', Package, P.PRODUCTS_VIEW),
        requiredNavItem(APP_ROUTES.categories, 'Nhóm VTHH', Tags, P.CATEGORIES_VIEW),
        requiredNavItem(APP_ROUTES.units, 'Đơn vị tính', Scale, P.UNITS_VIEW),
      ],
    },
    {
      id: 'warehouse-operations',
      label: 'Hoạt Động Kho',
      icon: PackageOpen,
      collapsible: true,
      separatorBefore: true,
      items: [
        requiredNavItem(
          APP_ROUTES.inboundRequests,
          'Yêu cầu nhập kho',
          ClipboardList,
          P.INBOUND_REQUESTS_VIEW
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, P.GOODS_RECEIPTS_VIEW),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, P.INVENTORY_VIEW),
        requiredNavItem(APP_ROUTES.transfers, 'Điều chuyển kho', ArrowLeftRight, P.TRANSFERS_VIEW),
        requiredNavItem(
          APP_ROUTES.stockIssueRequests,
          'Xuất kho & Trả hàng',
          PackageMinus,
          P.STOCK_ISSUE_REQUESTS_VIEW,
          [APP_ROUTES.goodsReturnRequests]
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
        plannedNavItem('Dự báo & Bổ sung hàng', TrendingUp),
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
          requiredPermission: P.SUBSCRIPTIONS_VIEW,
          match: 'exact',
        },
        {
          href: APP_ROUTES.subscriptionPayments,
          label: 'Lịch sử thanh toán',
          icon: ReceiptText,
          requiredPermission: P.SUBSCRIPTION_PLANS_VIEW,
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
        requiredNavItem(APP_ROUTES.notifications, 'Thông báo', Bell, P.NOTIFICATIONS_VIEW),
        requiredNavItem(APP_ROUTES.auditLogs, 'Nhật ký hoạt động', ScrollText, P.AUDIT_LOGS_VIEW),
        { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
      ],
    },
  ],
  [USER_ROLES.WarehouseManager]: [
    {
      id: 'workspace',
      items: [
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, P.DASHBOARD_VIEW, [
          APP_ROUTES.dashboardByRole.manager,
        ]),
      ],
    },
    {
      id: 'organization-management',
      label: 'Quản trị tổ chức',
      icon: Building2,
      collapsible: true,
      items: [requiredNavItem(APP_ROUTES.staff, 'Nhân viên', Users, P.STAFF_VIEW)],
    },
    {
      id: 'subjects',
      label: 'Đối tượng',
      icon: Users,
      collapsible: true,
      items: [
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, P.SUPPLIERS_VIEW),
        requiredNavItem(APP_ROUTES.stockRecipients, 'Khách hàng', Users, P.STOCK_RECIPIENTS_VIEW),
      ],
    },
    {
      id: 'catalog',
      label: 'Danh mục',
      icon: Tags,
      collapsible: true,
      items: [
        requiredNavItem(APP_ROUTES.products, 'Danh mục VTHH', Package, P.PRODUCTS_VIEW),
        requiredNavItem(APP_ROUTES.categories, 'Nhóm VTHH', Tags, P.CATEGORIES_VIEW),
        requiredNavItem(APP_ROUTES.units, 'Đơn vị tính', Scale, P.UNITS_VIEW),
      ],
    },
    {
      id: 'warehouse-management',
      label: 'Quản Lý Kho',
      icon: Warehouse,
      collapsible: true,
      items: [requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, P.WAREHOUSES_VIEW)],
    },
    {
      id: 'warehouse-operations',
      label: 'Hoạt Động Kho',
      icon: PackageOpen,
      collapsible: true,
      items: [
        requiredNavItem(
          APP_ROUTES.inboundRequests,
          'Yêu cầu nhập kho',
          ClipboardList,
          P.INBOUND_REQUESTS_VIEW
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, P.GOODS_RECEIPTS_VIEW),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, P.INVENTORY_VIEW),
        requiredNavItem(APP_ROUTES.transfers, 'Điều chuyển kho', ArrowLeftRight, P.TRANSFERS_VIEW),
        requiredNavItem(
          APP_ROUTES.stockIssueRequests,
          'Xuất kho & Trả hàng',
          PackageMinus,
          P.STOCK_ISSUE_REQUESTS_VIEW,
          [APP_ROUTES.goodsReturnRequests]
        ),
      ],
    },
    {
      id: 'system',
      label: 'Hệ thống',
      icon: Settings,
      collapsible: true,
      items: [
        requiredNavItem(APP_ROUTES.notifications, 'Thông báo', Bell, P.NOTIFICATIONS_VIEW),
        requiredNavItem(APP_ROUTES.auditLogs, 'Nhật ký hoạt động', ScrollText, P.AUDIT_LOGS_VIEW),
      ],
    },
  ],
  [USER_ROLES.WarehouseStaff]: [
    {
      id: 'workspace',
      items: [
        requiredNavItem(APP_ROUTES.dashboard, 'Dashboard', LayoutDashboard, P.DASHBOARD_VIEW, [
          APP_ROUTES.dashboardByRole.staff,
        ]),
      ],
    },
    {
      id: 'catalog',
      label: 'Danh mục',
      icon: Tags,
      collapsible: true,
      items: [
        requiredNavItem(APP_ROUTES.products, 'Danh mục VTHH', Package, P.PRODUCTS_VIEW),
        requiredNavItem(APP_ROUTES.categories, 'Nhóm VTHH', Tags, P.CATEGORIES_VIEW),
        requiredNavItem(APP_ROUTES.units, 'Đơn vị tính', Scale, P.UNITS_VIEW),
      ],
    },
    {
      id: 'subjects',
      label: 'Đối tượng',
      icon: Users,
      collapsible: true,
      items: [
        requiredNavItem(APP_ROUTES.suppliers, 'Nhà cung cấp', Truck, P.SUPPLIERS_VIEW),
        requiredNavItem(APP_ROUTES.stockRecipients, 'Khách hàng', Users, P.STOCK_RECIPIENTS_VIEW),
      ],
    },
    {
      id: 'warehouse-management',
      label: 'Quản Lý Kho',
      icon: Warehouse,
      collapsible: true,
      items: [requiredNavItem(APP_ROUTES.warehouses, 'Kho hàng', Warehouse, P.WAREHOUSES_VIEW)],
    },
    {
      id: 'warehouse-operations',
      label: 'Hoạt Động Kho',
      icon: PackageOpen,
      collapsible: true,
      items: [
        requiredNavItem(
          APP_ROUTES.inboundRequests,
          'Yêu cầu nhập kho',
          ClipboardList,
          P.INBOUND_REQUESTS_VIEW
        ),
        requiredNavItem(APP_ROUTES.inbound, 'Nhập kho', PackageCheck, P.GOODS_RECEIPTS_VIEW),
        requiredNavItem(APP_ROUTES.inventory, 'Tồn kho', PackageSearch, P.INVENTORY_VIEW),
        requiredNavItem(APP_ROUTES.transfers, 'Điều chuyển kho', ArrowLeftRight, P.TRANSFERS_VIEW),
        requiredNavItem(
          APP_ROUTES.stockIssueRequests,
          'Xuất kho & Trả hàng',
          PackageMinus,
          P.STOCK_ISSUE_REQUESTS_VIEW,
          [APP_ROUTES.goodsReturnRequests]
        ),
      ],
    },
    {
      id: 'system',
      label: 'Hệ thống',
      icon: Settings,
      collapsible: true,
      items: [requiredNavItem(APP_ROUTES.notifications, 'Thông báo', Bell, P.NOTIFICATIONS_VIEW)],
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
  href: string,
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
