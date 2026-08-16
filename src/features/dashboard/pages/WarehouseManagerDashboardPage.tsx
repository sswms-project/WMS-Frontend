'use client'

import { USER_ROLES } from '@/config/roles'
import { RoleGuard } from '../components/shared/RoleGuard'
import { WarehouseManagerDashboard } from '../components/manager/WarehouseManagerDashboard'

export function WarehouseManagerDashboardPage() {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.WarehouseManager]}>
      <WarehouseManagerDashboard />
    </RoleGuard>
  )
}
