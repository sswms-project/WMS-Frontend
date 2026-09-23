import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RoleResponse } from '../../types/admin.types'
import { RoleCard } from './RoleCard'

vi.mock('./RolePermissionEditor', () => ({
  RolePermissionEditor: ({ onClose }: { readonly onClose: () => void }) => (
    <div>
      <p>Danh sách quyền</p>
      <button type="button" onClick={onClose}>
        Đóng
      </button>
    </div>
  ),
}))

const role: RoleResponse = {
  id: 'warehouse-manager',
  roleName: 'Warehouse Manager',
  isSystemRole: false,
  parentRoleId: null,
  permissions: [],
}

describe('RoleCard', () => {
  it('lets the user close an expanded permission list from its bottom action', async () => {
    const user = userEvent.setup()
    render(<RoleCard role={role} />)

    const trigger = screen.getByRole('button', { name: /Warehouse Manager/i })
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Danh sách quyền')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Đóng' }))

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Danh sách quyền')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
