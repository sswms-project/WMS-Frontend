import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Truck,
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
    { href: APP_ROUTES.warehouses, label: 'Warehouses', icon: Warehouse },
    { href: APP_ROUTES.inventory, label: 'Inventory', icon: Boxes },
    { href: APP_ROUTES.orders, label: 'Orders', icon: Package },
    { href: APP_ROUTES.delivery, label: 'Delivery', icon: Truck },
    { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
    { href: APP_ROUTES.admin.roles, label: 'Phân quyền', icon: Shield },
  ],
  [USER_ROLES.TenantOwner]: [
    { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: APP_ROUTES.subscription, label: 'Gói dịch vụ', icon: CreditCard },
    { href: APP_ROUTES.warehouses, label: 'Warehouses', icon: Warehouse },
    { href: APP_ROUTES.inventory, label: 'Inventory', icon: Boxes },
    { href: APP_ROUTES.orders, label: 'Orders', icon: Package },
    { href: APP_ROUTES.delivery, label: 'Delivery', icon: Truck },
    { href: APP_ROUTES.settings.security, label: 'Cài đặt', icon: Settings },
  ],
  [USER_ROLES.WarehouseManager]: [
    { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: APP_ROUTES.warehouses, label: 'Warehouses', icon: Warehouse },
    { href: APP_ROUTES.inventory, label: 'Inventory', icon: Boxes },
    { href: APP_ROUTES.orders, label: 'Orders', icon: Package },
    { href: APP_ROUTES.delivery, label: 'Delivery', icon: Truck },
  ],
  [USER_ROLES.WarehouseStaff]: [
    { href: APP_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { href: APP_ROUTES.orders, label: 'Orders', icon: Package },
    { href: APP_ROUTES.delivery, label: 'Delivery', icon: Truck },
  ],
}
