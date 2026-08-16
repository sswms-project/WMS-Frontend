import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { INVITATION_STATUSES, type InvitationResponse } from '../types/invitation.types'
import {
  canResendInvitation,
  canRevokeInvitation,
  getInvitationDisplayStatus,
  getInvitationRoleLabel,
} from './invitation-status'

function createInvitation(overrides: Partial<InvitationResponse> = {}): InvitationResponse {
  return {
    id: 'invitation-1',
    email: 'staff@example.com',
    role: USER_ROLES.WarehouseStaff,
    warehouseId: null,
    status: INVITATION_STATUSES.pending,
    createdAt: '2026-08-01T00:00:00.000Z',
    expiresAt: '2026-08-08T00:00:00.000Z',
    ...overrides,
  }
}

describe('invitation status helpers', () => {
  it('shows an overdue pending invitation as expired', () => {
    const invitation = createInvitation()

    expect(getInvitationDisplayStatus(invitation, Date.parse('2026-08-09T00:00:00.000Z'))).toBe(
      INVITATION_STATUSES.expired
    )
  })

  it('keeps backend-supported actions aligned with invitation status', () => {
    const pendingInvitation = createInvitation({ expiresAt: '2999-01-01T00:00:00.000Z' })
    const acceptedInvitation = createInvitation({ status: INVITATION_STATUSES.accepted })

    expect(canResendInvitation(pendingInvitation)).toBe(true)
    expect(canRevokeInvitation(pendingInvitation)).toBe(true)
    expect(canResendInvitation(acceptedInvitation)).toBe(false)
    expect(canRevokeInvitation(acceptedInvitation)).toBe(false)
  })

  it('does not expose an unknown role identifier', () => {
    expect(getInvitationRoleLabel(USER_ROLES.WarehouseManager)).toBe('Quản lý kho')
    expect(getInvitationRoleLabel('28de7de6-f1eb-4abb-953b-923c7161cc65')).toBe('Chưa xác định')
  })
})
