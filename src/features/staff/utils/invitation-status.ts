import { USER_ROLES } from '@/config/roles'
import {
  INVITATION_STATUSES,
  type InvitationResponse,
  type InvitationStatus,
} from '../types/invitation.types'

export function getInvitationDisplayStatus(
  invitation: InvitationResponse,
  now = Date.now()
): InvitationStatus {
  if (
    invitation.status === INVITATION_STATUSES.pending &&
    Date.parse(invitation.expiresAt) <= now
  ) {
    return INVITATION_STATUSES.expired
  }

  return invitation.status
}

export function canResendInvitation(invitation: InvitationResponse): boolean {
  const displayStatus = getInvitationDisplayStatus(invitation)
  return (
    invitation.status === INVITATION_STATUSES.pending ||
    displayStatus === INVITATION_STATUSES.expired
  )
}

export function canRevokeInvitation(invitation: InvitationResponse): boolean {
  return invitation.status === INVITATION_STATUSES.pending
}

export function getInvitationRoleLabel(role: string): string {
  if (role === USER_ROLES.WarehouseManager) return 'Quản lý kho'
  if (role === USER_ROLES.WarehouseStaff) return 'Nhân viên kho'
  return 'Chưa xác định'
}
