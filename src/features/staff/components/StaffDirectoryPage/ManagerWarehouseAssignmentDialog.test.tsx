import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import type { StaffResponse } from '../../types/staff.types'
import { ManagerWarehouseAssignmentDialog } from './ManagerWarehouseAssignmentDialog'

const mocks = vi.hoisted(() => ({
  assignManager: vi.fn(),
  closeDialog: vi.fn(),
  error: null as { message: string } | null,
  isPending: false,
  resetMutation: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))

vi.mock('../../hooks/use-manager-assignment', () => ({
  useAssignmentWarehousesQuery: () => ({
    data: {
      items: [
        {
          id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
          warehouseCode: 'WH-HCM',
          warehouseName: 'Kho Thành phố Hồ Chí Minh',
          address: 'Quận 7',
          status: 'Active',
          createdAt: '2026-08-18T00:00:00Z',
        },
      ],
      totalCount: 1,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useAssignManagerMutation: () => ({
    mutateAsync: mocks.assignManager,
    isPending: mocks.isPending,
    error: mocks.error,
    reset: mocks.resetMutation,
  }),
}))

const manager: StaffResponse = {
  id: 'manager-1',
  fullName: 'Nguyễn Quản Lý',
  email: 'manager@example.com',
  phone: null,
  role: USER_ROLES.WarehouseManager,
  status: 'Active',
  lastLoginAt: null,
}

describe('ManagerWarehouseAssignmentDialog', () => {
  beforeEach(() => {
    mocks.assignManager.mockReset()
    mocks.assignManager.mockResolvedValue({ data: null })
    mocks.closeDialog.mockReset()
    mocks.error = null
    mocks.isPending = false
    mocks.resetMutation.mockReset()
  })

  it('explains that assigning another warehouse keeps existing assignments', () => {
    render(
      <ManagerWarehouseAssignmentDialog manager={manager} onOpenChange={mocks.closeDialog} />
    )

    expect(screen.getByText(/Một quản lý có thể phụ trách nhiều kho/)).toBeInTheDocument()
    expect(screen.getByText('Phân công bổ sung')).toBeInTheDocument()
    expect(screen.getByText(/không ảnh hưởng đến các kho/)).toBeInTheDocument()
    expect(screen.queryByText(/thay thế/)).not.toBeInTheDocument()
  })

  it('submits the selected warehouse and manager without replacing another assignment', async () => {
    const user = userEvent.setup()
    render(
      <ManagerWarehouseAssignmentDialog manager={manager} onOpenChange={mocks.closeDialog} />
    )

    await user.click(screen.getByRole('radio', { name: /Kho Thành phố Hồ Chí Minh/ }))
    await user.click(screen.getByRole('button', { name: 'Gán vào kho' }))

    expect(mocks.assignManager).toHaveBeenCalledWith({
      warehouseId: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
      request: { managerId: manager.id },
    })
    expect(mocks.closeDialog).toHaveBeenCalledWith(false)
  })

  it('does not call the API until a warehouse is selected', async () => {
    const user = userEvent.setup()
    render(
      <ManagerWarehouseAssignmentDialog manager={manager} onOpenChange={mocks.closeDialog} />
    )

    await user.click(screen.getByRole('button', { name: 'Gán vào kho' }))

    expect(mocks.assignManager).not.toHaveBeenCalled()
    expect(screen.getByText('Vui lòng chọn một kho')).toBeInTheDocument()
  })

  it('shows the backend conflict without implying another assignment was replaced', () => {
    mocks.error = { message: 'Manager is already assigned to this warehouse' }

    render(
      <ManagerWarehouseAssignmentDialog manager={manager} onOpenChange={mocks.closeDialog} />
    )

    expect(screen.getByText('Không thể gán quản lý')).toBeInTheDocument()
    expect(screen.getByText(mocks.error.message)).toBeInTheDocument()
    expect(screen.queryByText(/thay thế/)).not.toBeInTheDocument()
  })

  it('locks dialog actions while the assignment is pending', () => {
    mocks.isPending = true

    render(
      <ManagerWarehouseAssignmentDialog manager={manager} onOpenChange={mocks.closeDialog} />
    )

    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gán vào kho' })).toBeDisabled()
  })
})
