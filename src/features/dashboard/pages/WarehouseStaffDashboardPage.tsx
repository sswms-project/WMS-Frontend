'use client'

import { USER_ROLES } from '@/config/roles'
import { RoleGuard } from '../components/shared/RoleGuard'
import { WarehouseStaffDashboard } from '../components/staff/WarehouseStaffDashboard'

export function WarehouseStaffDashboardPage() {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.WarehouseStaff]}>
      <WarehouseStaffDashboard />
    </RoleGuard>
  )
}
