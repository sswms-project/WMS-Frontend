import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StaffDirectoryPage } from './StaffDirectoryPage'

const pageState = vi.hoisted(() => ({
  warehousesQuery: {
    data: undefined,
    isLoading: false,
    isError: true,
    isFetching: false,
    refetch: vi.fn(),
  },
}))

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: string) => value,
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { role: string } }) => unknown) =>
    selector({ user: { role: 'Tenant Owner' } }),
}))

vi.mock('../components/StaffDirectoryPage', () => ({
  InviteStaffDialog: () => null,
  InvitationManagementPanel: () => null,
  InvitationRevokeDialog: () => null,
  ManagerWarehouseAssignmentDialog: () => null,
  StaffDetailsSheet: () => null,
  StaffDirectoryPagination: () => null,
  StaffDirectoryTable: () => <div>Danh sách quản lý kho</div>,
  StaffDirectoryToolbar: () => null,
  StaffLifecycleDialog: () => null,
}))

vi.mock('../hooks/use-invitations', () => ({
  useInvitationsQuery: () => ({
    data: { items: [], totalCount: 0 },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useResendInvitationMutation: () => ({ isPending: false, variables: null, mutateAsync: vi.fn() }),
  useRevokeInvitationMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock('../hooks/use-manager-assignment', () => ({
  useAssignmentWarehousesQuery: () => pageState.warehousesQuery,
}))

vi.mock('../hooks/use-staff', () => ({
  useDeactivateStaffMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useReactivateStaffMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useStaffDetailsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useStaffListQuery: () => ({
    data: {
      items: [
        {
          id: 'manager-1',
          fullName: 'Warehouse Manager Demo',
          email: 'warehouse.manager@sswms.local',
          phone: null,
          role: 'Warehouse Manager',
          status: 'Active',
          lastLoginAt: null,
          assignedWarehouseIds: ['warehouse-1'],
        },
      ],
      totalCount: 1,
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

describe('StaffDirectoryPage warehouse scope states', () => {
  beforeEach(() => {
    pageState.warehousesQuery.refetch.mockReset()
  })

  it('keeps the directory available and offers retry when warehouse details fail', () => {
    render(<StaffDirectoryPage />)

    expect(screen.getAllByText('Danh sách quản lý kho')).not.toHaveLength(0)
    expect(screen.getAllByRole('tablist')[0]).toHaveClass('w-full', 'border-b')
    expect(screen.getAllByRole('tablist')[0].parentElement).toHaveClass('flex-col')
    expect(screen.getAllByRole('tablist')[0].parentElement).not.toHaveClass('xl:flex-row')
    expect(screen.getByRole('tabpanel')).toHaveClass('min-w-0')
    expect(screen.getByRole('region', { name: 'Danh sách quản lý kho' })).toHaveClass(
      'min-w-0',
      'overflow-hidden'
    )
    expect(screen.getByText('Không thể tải phạm vi kho')).toBeInTheDocument()
    expect(
      screen.getByText('Danh sách nhân sự vẫn khả dụng, nhưng tên kho chưa thể hiển thị.')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(pageState.warehousesQuery.refetch).toHaveBeenCalledOnce()
  })
})
