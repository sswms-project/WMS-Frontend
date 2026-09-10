import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { AcceptInvitationForm } from './AcceptInvitationForm'

const existingAccountPreview = {
  fullName: 'Nguyễn Văn A',
  email: 'staff@example.com',
  tenantName: 'KOVIA Demo',
  role: USER_ROLES.WarehouseStaff,
  warehouses: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      warehouseCode: 'FPT-01',
      warehouseName: 'Kho Kovia',
    },
  ],
  expiresAt: '2026-09-09T00:00:00Z',
  effectiveStatus: 'Pending',
  accountMode: 'ExistingAccount' as const,
}

describe('AcceptInvitationForm', () => {
  it('sends a newly activated account to sign in instead of a protected dashboard', () => {
    render(
      <AcceptInvitationForm
        token="valid-token"
        preview={{ ...existingAccountPreview, accountMode: 'NewAccount' }}
        isPreviewLoading={false}
        isAuthenticated={false}
        isLoading={false}
        isSuccess
        onSubmit={vi.fn()}
        onAcceptExisting={vi.fn()}
      />
    )

    expect(screen.getAllByRole('link', { name: 'Đăng nhập' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Đăng nhập' })[1]).toHaveAttribute(
      'href',
      '/auth/login'
    )
    expect(screen.queryByRole('link', { name: 'Đi tới Dashboard' })).not.toBeInTheDocument()
  })

  it('keeps invitation context and retry action visible after an action error', () => {
    render(
      <AcceptInvitationForm
        token="valid-token"
        preview={existingAccountPreview}
        isPreviewLoading={false}
        isAuthenticated
        authenticatedEmail="staff@example.com"
        isLoading={false}
        isSuccess={false}
        actionErrorMessage="Không thể chuyển tổ chức. Vui lòng thử lại."
        onSubmit={vi.fn()}
        onAcceptExisting={vi.fn()}
      />
    )

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText('Không thể chuyển tổ chức. Vui lòng thử lại.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chấp nhận và chuyển tổ chức' })).toBeEnabled()
  })

  it('uses a blocking error state only when invitation preview fails', () => {
    render(
      <AcceptInvitationForm
        token="invalid-token"
        isPreviewLoading={false}
        isAuthenticated={false}
        isLoading={false}
        isSuccess={false}
        errorMessage="Invitation link is invalid."
        onSubmit={vi.fn()}
        onAcceptExisting={vi.fn()}
      />
    )

    expect(screen.getByText('Không thể sử dụng lời mời')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Chấp nhận và chuyển tổ chức' })
    ).not.toBeInTheDocument()
  })

  it('does not offer acceptance while a different account is authenticated', () => {
    render(
      <AcceptInvitationForm
        token="valid-token"
        preview={existingAccountPreview}
        isPreviewLoading={false}
        isAuthenticated
        authenticatedEmail="different@example.com"
        isLoading={false}
        isSuccess={false}
        onSubmit={vi.fn()}
        onAcceptExisting={vi.fn()}
      />
    )

    expect(screen.getByText('Đang đăng nhập sai tài khoản')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Đăng nhập bằng tài khoản khác' })).toHaveAttribute(
      'href',
      expect.stringContaining('returnUrl=')
    )
    expect(
      screen.queryByRole('button', { name: 'Chấp nhận và chuyển tổ chức' })
    ).not.toBeInTheDocument()
  })

  it('collects a full name when accepting a legacy invitation without one', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <AcceptInvitationForm
        token="legacy-token"
        preview={{ ...existingAccountPreview, fullName: '', accountMode: 'NewAccount' }}
        isPreviewLoading={false}
        isAuthenticated={false}
        isLoading={false}
        isSuccess={false}
        onSubmit={onSubmit}
        onAcceptExisting={vi.fn()}
      />
    )

    expect(screen.getByRole('textbox', { name: 'Họ và tên' })).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Họ và tên' }), 'Legacy Staff')
    await user.type(screen.getByLabelText('Mật khẩu'), 'Password1!')
    await user.type(screen.getByLabelText('Xác nhận mật khẩu'), 'Password1!')
    await user.click(screen.getByRole('button', { name: 'Kích hoạt tài khoản' }))

    expect(onSubmit).toHaveBeenCalledWith(
      {
        fullName: 'Legacy Staff',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      },
      expect.anything()
    )
  })
})
