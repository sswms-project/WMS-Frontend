'use client'

import { USER_ROLES } from '@/config/roles'
import { RoleGuard } from '../components/shared/RoleGuard'
import { TenantOwnerDashboard } from '../components/tenant/TenantOwnerDashboard'

export function TenantOwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.TenantOwner]}>
      <TenantOwnerDashboard />
    </RoleGuard>
  )
}
