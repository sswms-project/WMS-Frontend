import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { StaffInvitation } from './StaffInvitation'

const state = vi.hoisted(() => ({ query: vi.fn(), mutation: vi.fn(), send: vi.fn() }))
vi.mock('../../hooks/use-manager-assignment', () => ({
  useInvitationWarehousesInfiniteQuery: state.query,
}))
vi.mock('../../hooks/use-invitations', () => ({ useSendInvitationMutation: state.mutation }))

describe('Staff invitation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.query.mockReturnValue({
      data: {
        pages: [
          {
            totalCount: 2,
            items: [
              {
                id: '11111111-1111-1111-1111-111111111111',
                warehouseCode: 'A',
                warehouseName: 'Kho A',
                status: 'Active',
              },
              {
                id: '22222222-2222-2222-2222-222222222222',
                warehouseCode: 'B',
                warehouseName: 'Kho B',
                status: 'Active',
              },
            ],
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    })
    state.mutation.mockReturnValue({ isPending: false, error: null, mutateAsync: state.send })
  })

  it('shows supported roles and allows multiple initial warehouses', async () => {
    const user = userEvent.setup()
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    expect(screen.getByRole('radio', { name: 'Quản lý kho' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'Nhân viên kho' }))
    await user.click(screen.getByRole('checkbox', { name: /A.*Kho A/ }))
    await user.click(screen.getByRole('checkbox', { name: /B.*Kho B/ }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })

  it('submits owner-provided name, email, role and selected warehouses', async () => {
    const user = userEvent.setup()
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    await user.type(screen.getByRole('textbox', { name: 'Họ và tên' }), 'Nguyen Van A')
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'person@example.com')
    await user.click(screen.getByRole('checkbox', { name: /A.*Kho A/ }))
    await user.click(screen.getByRole('checkbox', { name: /B.*Kho B/ }))
    await user.click(screen.getByRole('button', { name: 'Gửi lời mời' }))
    await waitFor(() =>
      expect(state.send).toHaveBeenCalledWith({
        fullName: 'Nguyen Van A',
        email: 'person@example.com',
        role: USER_ROLES.WarehouseManager,
        warehouseIds: [
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
        ],
      })
    )
  })

  it.each(['loading', 'empty', 'error'] as const)('disables invite in %s state', (mode) => {
    state.query.mockReturnValue({
      data: { pages: [{ items: [], totalCount: 0 }] },
      isLoading: mode === 'loading',
      isFetchingNextPage: false,
      hasNextPage: false,
      isError: mode === 'error',
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    })
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Gửi lời mời' })).toBeDisabled()
  })

  it('keeps selected warehouses while searching another server-side page', async () => {
    const warehouseA = {
      id: '11111111-1111-1111-1111-111111111111',
      warehouseCode: 'A',
      warehouseName: 'Kho A',
      status: 'Active',
    }
    const warehouseB = {
      id: '22222222-2222-2222-2222-222222222222',
      warehouseCode: 'B',
      warehouseName: 'Kho B',
      status: 'Active',
    }
    state.query.mockImplementation((searchText: string) => ({
      data: {
        pages: [
          {
            items: searchText === 'Kho B' ? [warehouseB] : [warehouseA],
            totalCount: 1,
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    }))
    const user = userEvent.setup()
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)

    await user.click(screen.getByRole('checkbox', { name: /A.*Kho A/ }))
    await user.type(screen.getByRole('textbox', { name: 'Tìm kho' }), 'Kho B')

    expect(await screen.findByRole('checkbox', { name: /B.*Kho B/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /A.*Bỏ chọn Kho A/ })).toBeInTheDocument()
  })
})
