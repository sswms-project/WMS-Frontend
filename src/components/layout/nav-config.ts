import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { USER_ROLES, type UserRole } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  [USER_ROLES.SystemAdmin]: [
    { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
    { href: APP_ROUTES.admin.roles, label: 'Phân quyền', icon: Shield },
    { href: APP_ROUTES.admin.subscriptionPlans, label: 'Gói đăng ký', icon: CreditCard },
  ],
  [USER_ROLES.TenantOwner]: [
    { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: APP_ROUTES.organization, label: 'Tổ chức', icon: Building2 },
    { href: APP_ROUTES.staff, label: 'Nhân sự', icon: Users },
    { href: APP_ROUTES.subscription, label: 'Gói dịch vụ', icon: CreditCard },
    { href: APP_ROUTES.warehouses, label: 'Kho hàng', icon: Warehouse },
    { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
  ],
  [USER_ROLES.WarehouseManager]: [
    { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: APP_ROUTES.staff, label: 'Nhân sự', icon: Users },
    { href: APP_ROUTES.warehouses, label: 'Kho hàng', icon: Warehouse },
  ],
  [USER_ROLES.WarehouseStaff]: [
    { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: APP_ROUTES.warehouses, label: 'Kho hàng', icon: Warehouse },
  ],
}
