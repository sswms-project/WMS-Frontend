import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { STAFF_DIRECTORY_KINDS, type StaffResponse } from '../../types/staff.types'
import { StaffDirectoryTable } from './StaffDirectoryTable'

const manager: StaffResponse = {
  id: 'manager-1',
  fullName: 'Nguyen Quan Ly',
  email: 'manager@example.com',
  phone: null,
  role: USER_ROLES.WarehouseManager,
  status: 'Active',
  lastLoginAt: null,
}

const staff: StaffResponse = {
  ...manager,
  id: 'staff-1',
  fullName: 'Nguyen Nhan Vien',
  email: 'staff@example.com',
  role: USER_ROLES.WarehouseStaff,
}

const actions = {
  onView: vi.fn(),
  onAssignWarehouse: vi.fn(),
  onLifecycleAction: vi.fn(),
}

describe('StaffDirectoryTable', () => {
  it('keeps manager assignment available without exposing staff lifecycle actions', async () => {
    const user = userEvent.setup()
    render(
      <StaffDirectoryTable kind={STAFF_DIRECTORY_KINDS.managers} people={[manager]} {...actions} />
    )

    await user.click(screen.getAllByRole('button', { name: `Thao tác với ${manager.fullName}` })[0])

    expect(screen.getByRole('menuitem', { name: 'Gán vào kho' })).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Vô hiệu hóa tài khoản' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Phạm vi kho')).not.toBeInTheDocument()
  })

  it('offers lifecycle actions only in the staff directory', async () => {
    const user = userEvent.setup()
    render(<StaffDirectoryTable kind={STAFF_DIRECTORY_KINDS.staff} people={[staff]} {...actions} />)

    await user.click(screen.getAllByRole('button', { name: `Thao tác với ${staff.fullName}` })[0])

    expect(screen.getByRole('menuitem', { name: 'Vô hiệu hóa tài khoản' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Gán vào kho' })).not.toBeInTheDocument()
  })
})
