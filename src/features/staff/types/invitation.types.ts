import type { QueryInfo } from '@/types/api'
import type { USER_ROLES } from '@/config/roles'

export type InvitableRole = typeof USER_ROLES.WarehouseManager | typeof USER_ROLES.WarehouseStaff

export interface SendInvitationRequest {
  email: string
  role: InvitableRole
  warehouseId?: string
}

export interface InvitationResponse {
  id: string
  email: string
  role: InvitableRole
  warehouseId?: string
  status: string
  createdAt: string
  expiresAt: string
}

export interface InvitationQuery extends QueryInfo {}

export interface AcceptInvitationRequest {
  fullName: string
  password: string
}
