import type { USER_ROLES } from '@/config/roles'
import type { QueryInfo } from '@/types/api'

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

export const INVITATION_STATUSES = {
  pending: 'Pending',
  accepted: 'Accepted',
  expired: 'Expired',
  revoked: 'Revoked',
} as const

export type InvitationStatus = (typeof INVITATION_STATUSES)[keyof typeof INVITATION_STATUSES]

export interface InvitationResponse {
  id: string
  email: string
  role: string
  warehouseId: string | null
  status: InvitationStatus
  expiresAt: string
  createdAt: string
}

export interface InvitationQuery extends QueryInfo {
  top: number
  skip: number
  needTotalCount: true
}
