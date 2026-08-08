import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { INVITATION_STATUSES, type InvitationResponse } from '../../types/invitation.types'
import { InvitationManagementTable } from './InvitationManagementTable'

function createInvitation(overrides: Partial<InvitationResponse> = {}): InvitationResponse {
  return {
    id: 'invitation-1',
    email: 'staff@example.com',
    role: USER_ROLES.WarehouseStaff,
    warehouseId: null,
    status: INVITATION_STATUSES.pending,
    createdAt: '2026-08-01T00:00:00.000Z',
    expiresAt: '2999-08-08T00:00:00.000Z',
    ...overrides,
  }
}

function getInvitationActionButton(email: string) {
  const button = screen.getAllByRole('button', { name: `Thao tác với ${email}` }).at(0)
  if (!button) throw new Error(`Missing action button for ${email}`)
  return button
}

describe('InvitationManagementTable', () => {
  it('keeps an unknown role identifier out of the UI', () => {
    const roleId = '28de7de6-f1eb-4abb-953b-923c7161cc65'

    render(
      <InvitationManagementTable
        invitations={[createInvitation({ role: roleId })]}
        resendingId={null}
        onResend={vi.fn()}
        onRevoke={vi.fn()}
      />
    )

    expect(screen.getAllByText('Chưa xác định')).not.toHaveLength(0)
    expect(screen.queryByText(roleId)).not.toBeInTheDocument()
  })

  it('exposes resend and revoke actions for a pending invitation', async () => {
    const user = userEvent.setup()
    const invitation = createInvitation()
    const onResend = vi.fn()
    const onRevoke = vi.fn()

    render(
      <InvitationManagementTable
        invitations={[invitation]}
        resendingId={null}
        onResend={onResend}
        onRevoke={onRevoke}
      />
    )

    await user.click(getInvitationActionButton(invitation.email))
    await user.click(screen.getByRole('menuitem', { name: 'Gửi lại lời mời' }))
    expect(onResend).toHaveBeenCalledWith(invitation)

    await user.click(getInvitationActionButton(invitation.email))
    await user.click(screen.getByRole('menuitem', { name: 'Thu hồi lời mời' }))
    expect(onRevoke).toHaveBeenCalledWith(invitation)
  }, 15_000)

  it('marks an overdue pending invitation as expired', () => {
    render(
      <InvitationManagementTable
        invitations={[createInvitation({ expiresAt: '2020-01-01T00:00:00.000Z' })]}
        resendingId={null}
        onResend={vi.fn()}
        onRevoke={vi.fn()}
      />
    )

    expect(screen.getAllByText('Hết hạn')).not.toHaveLength(0)
  })
})
