import type { USER_ROLES } from '@/config/roles'

export type InvitableRole = typeof USER_ROLES.WarehouseManager | typeof USER_ROLES.WarehouseStaff

export interface SendInvitationRequest {
  email: string
  role: InvitableRole
  warehouseId?: string
}

export interface AcceptInvitationRequest {
  fullName: string
  password: string
}
