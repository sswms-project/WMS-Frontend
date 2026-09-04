import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { StaffWarehouseAssignment } from './StaffWarehouseAssignment'

const state = vi.hoisted(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
  save: vi.fn(),
  refetch: vi.fn(),
  reset: vi.fn(),
}))
vi.mock('../../hooks/use-manager-assignment', () => ({
  useStaffWarehouseAssignmentsQuery: state.query,
  useUpdateStaffWarehousesMutation: state.mutation,
}))
const warehouseA = {
  id: '11111111-1111-1111-1111-111111111111',
  warehouseCode: 'A',
  warehouseName: 'Kho A',
  status: 'Active',
  managerId: null,
  managerName: null,
}
const warehouseB = {
  id: '22222222-2222-2222-2222-222222222222',
  warehouseCode: 'B',
  warehouseName: 'Kho B',
  status: 'Active',
  managerId: '44444444-4444-4444-4444-444444444444',
  managerName: 'Quản lý cũ',
}
const person = {
  id: 'member',
  fullName: 'Nhân sự thử nghiệm',
  email: 'test@example.com',
  phone: null,
  role: USER_ROLES.WarehouseStaff as string,
  status: 'Active',
  lastLoginAt: null,
  assignedWarehouseIds: ['11111111-1111-1111-1111-111111111111'],
}

describe('Staff warehouse assignment workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.query.mockReturnValue({
      data: {
        assignedWarehouseIds: ['11111111-1111-1111-1111-111111111111'],
        warehouses: [warehouseA, warehouseB],
      },
      isFetching: false,
      isError: false,
      refetch: state.refetch,
    })
    state.mutation.mockReturnValue({
      mutateAsync: state.save,
      reset: state.reset,
      isPending: false,
      error: null,
    })
    state.save.mockResolvedValue({})
    state.refetch.mockResolvedValue({
      isError: false,
      data: { assignedWarehouseIds: [warehouseA.id], warehouses: [warehouseA, warehouseB] },
    })
  })

  it('adds a second staff warehouse in one request with the original snapshot', async () => {
    const onClose = vi.fn()
    render(<StaffWarehouseAssignment person={person} onClose={onClose} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    await userEvent.click(screen.getByRole('button', { name: 'Lưu phân công' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(state.save).toHaveBeenCalledExactlyOnceWith({
      warehouseIds: [
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ],
      expectedWarehouseIds: ['11111111-1111-1111-1111-111111111111'],
      replacements: [],
    })
  })

  it('blocks removing the last active staff warehouse', async () => {
    render(<StaffWarehouseAssignment person={person} onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho A' }))
    expect(screen.getByText('Nhân viên cần ít nhất một kho đang hoạt động.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeDisabled()
    expect(state.save).not.toHaveBeenCalled()
  })

  it('does not silently adopt a refreshed assignment snapshot while editing', async () => {
    const onClose = vi.fn()
    const view = render(<StaffWarehouseAssignment person={person} onClose={onClose} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeEnabled()
    state.query.mockReturnValue({
      data: {
        assignedWarehouseIds: [
          '11111111-1111-1111-1111-111111111111',
          '33333333-3333-3333-3333-333333333333',
        ],
        warehouses: [
          warehouseA,
          warehouseB,
          { ...warehouseA, id: '33333333-3333-3333-3333-333333333333', warehouseName: 'Kho C' },
        ],
      },
      isFetching: false,
      isError: false,
      refetch: state.refetch,
    })
    view.rerender(<StaffWarehouseAssignment person={person} onClose={onClose} />)
    const saveButton = screen.getByRole('button', { name: 'Lưu phân công' })
    expect(saveButton).toBeDisabled()
    await userEvent.click(saveButton)
    expect(state.save).not.toHaveBeenCalled()
    expect(screen.getByText(/Phân công kho đã thay đổi/)).toBeInTheDocument()
  })

  it('does not transfer confirmation to a different manager after a background refresh', async () => {
    const manager = { ...person, role: USER_ROLES.WarehouseManager }
    const onClose = vi.fn()
    const view = render(<StaffWarehouseAssignment person={manager} onClose={onClose} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Tôi xác nhận/ }))
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeEnabled()
    state.query.mockReturnValue({
      data: {
        assignedWarehouseIds: ['11111111-1111-1111-1111-111111111111'],
        warehouses: [
          warehouseA,
          {
            ...warehouseB,
            managerId: '55555555-5555-5555-5555-555555555555',
            managerName: 'Manager khác',
          },
        ],
      },
      isFetching: false,
      isError: false,
      refetch: state.refetch,
    })
    view.rerender(<StaffWarehouseAssignment person={manager} onClose={onClose} />)
    const saveButton = screen.getByRole('button', { name: 'Lưu phân công' })
    expect(saveButton).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: /Tôi xác nhận/ })).not.toBeChecked()
    await userEvent.click(saveButton)
    expect(state.save).not.toHaveBeenCalled()
    const newData = state.query.mock.results.at(-1)?.value.data
    state.refetch.mockResolvedValue({ isError: false, data: newData })
    await userEvent.click(screen.getByRole('button', { name: 'Tải lại dữ liệu' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeDisabled()
    expect(screen.getByText(/Manager khác →/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: /Tôi xác nhận/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Lưu phân công' }))
    await waitFor(() =>
      expect(state.save).toHaveBeenCalledExactlyOnceWith({
        warehouseIds: [warehouseA.id, warehouseB.id],
        expectedWarehouseIds: [warehouseA.id],
        replacements: [
          { warehouseId: warehouseB.id, managerId: '55555555-5555-5555-5555-555555555555' },
        ],
      })
    )
  })

  it('keeps the draft and conflict guard when reload fails', async () => {
    state.mutation.mockReturnValue({
      mutateAsync: state.save,
      reset: state.reset,
      isPending: false,
      error: { statusCode: 409, message: 'Assignments changed' },
    })
    state.refetch.mockResolvedValue({ isError: true, data: undefined })
    render(<StaffWarehouseAssignment person={person} onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    await userEvent.click(screen.getByRole('button', { name: 'Tải lại dữ liệu' }))
    expect(screen.getByRole('checkbox', { name: 'Kho B' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeDisabled()
    expect(state.reset).not.toHaveBeenCalled()
    expect(state.save).not.toHaveBeenCalled()
  })

  it('requires explicit replacement confirmation and sends the expected manager', async () => {
    render(
      <StaffWarehouseAssignment
        person={{ ...person, role: USER_ROLES.WarehouseManager }}
        onClose={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /Tôi xác nhận/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Lưu phân công' }))
    await waitFor(() =>
      expect(state.save).toHaveBeenCalledExactlyOnceWith({
        warehouseIds: [
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
        ],
        expectedWarehouseIds: ['11111111-1111-1111-1111-111111111111'],
        replacements: [
          {
            warehouseId: '22222222-2222-2222-2222-222222222222',
            managerId: '44444444-4444-4444-4444-444444444444',
          },
        ],
      })
    )
  })

  it('resets replacement confirmation when selection changes', async () => {
    render(
      <StaffWarehouseAssignment
        person={{ ...person, role: USER_ROLES.WarehouseManager }}
        onClose={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Tôi xác nhận/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho A' }))
    expect(screen.getByRole('checkbox', { name: /Tôi xác nhận/ })).not.toBeChecked()
  })

  it('filters locally without dropping selected warehouses', async () => {
    render(<StaffWarehouseAssignment person={person} onClose={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm kho' }), {
      target: { value: 'Kho B' },
    })
    expect(screen.queryByRole('checkbox', { name: 'Kho A' })).not.toBeInTheDocument()
    expect(screen.getByText('1 kho đã chọn')).toBeInTheDocument()
    expect(state.refetch).not.toHaveBeenCalled()
  })

  it.each(['loading', 'empty', 'error'] as const)(
    'renders %s state without allowing writes',
    (mode) => {
      state.query.mockReturnValue({
        data: mode === 'empty' ? { assignedWarehouseIds: [], warehouses: [] } : undefined,
        isFetching: mode === 'loading',
        isError: mode === 'error',
        refetch: state.refetch,
      })
      render(<StaffWarehouseAssignment person={person} onClose={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeDisabled()
      expect(
        screen.getByText(
          mode === 'loading'
            ? 'Đang tải phân công kho...'
            : mode === 'empty'
              ? 'Chưa có kho khả dụng.'
              : 'Không thể tải danh sách kho.'
        )
      ).toBeInTheDocument()
    }
  )

  it('requires reload after a conflict and offers a retry', async () => {
    state.mutation.mockReturnValue({
      mutateAsync: state.save,
      reset: state.reset,
      isPending: false,
      error: { statusCode: 409, message: 'Assignments changed' },
    })
    render(<StaffWarehouseAssignment person={person} onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Kho B' }))
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Tải lại dữ liệu' }))
    expect(state.refetch).toHaveBeenCalledOnce()
    expect(state.reset).toHaveBeenCalledOnce()
  })

  it('blocks a second submission while pending', async () => {
    state.mutation.mockReturnValue({ isPending: true, error: null, mutateAsync: state.save })
    render(<StaffWarehouseAssignment person={person} onClose={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: 'Kho B' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Lưu phân công' })).toBeDisabled()
  })
})
