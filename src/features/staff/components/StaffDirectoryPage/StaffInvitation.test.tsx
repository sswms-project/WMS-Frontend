import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { StaffInvitation } from './StaffInvitation'
import type { WarehouseAssignmentQuery } from '../../types/manager-assignment.types'

const state = vi.hoisted(() => ({ query: vi.fn(), mutation: vi.fn(), send: vi.fn() }))
vi.mock('../../hooks/use-manager-assignment', () => ({ useAssignmentWarehousesQuery: state.query }))
vi.mock('../../hooks/use-invitations', () => ({ useSendInvitationMutation: state.mutation }))

describe('Staff invitation', () => {
  beforeAll(() => {
    // jsdom does not implement the pointer/scroll APIs used by Radix Select.
    Object.defineProperties(HTMLElement.prototype, {
      hasPointerCapture: { configurable: true, value: () => false },
      setPointerCapture: { configurable: true, value: () => {} },
      releasePointerCapture: { configurable: true, value: () => {} },
      scrollIntoView: { configurable: true, value: () => {} },
    })
  })
  beforeEach(() => {
    vi.clearAllMocks()
    state.query.mockReturnValue({
      data: {
        items: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            warehouseCode: 'A',
            warehouseName: 'Kho A',
            status: 'Active',
          },
        ],
      },
      isLoading: false,
      isError: false,
    })
    state.mutation.mockReturnValue({ isPending: false, error: null, mutateAsync: state.send })
  })

  it('visibly checks the selected role and keeps the warehouse picker for both roles', () => {
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    const manager = screen.getByRole('radio', { name: 'Quản lý kho' })
    expect(manager).toBeChecked()
    expect(manager).toHaveAttribute('data-state', 'checked')
    expect(manager).toHaveClass('data-[state=checked]:bg-primary')
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Nhân viên kho' }))
    expect(screen.getByRole('radio', { name: 'Nhân viên kho' })).toBeChecked()
    expect(manager).not.toBeChecked()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('does not submit without an initial warehouse', async () => {
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
      target: { value: 'person@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }))
    await waitFor(() =>
      expect(screen.getByText('Vui lòng chọn kho làm việc ban đầu')).toBeInTheDocument()
    )
    expect(state.send).not.toHaveBeenCalled()
  })

  it('selects a warehouse beyond the first 100 and preserves it when changing pages', async () => {
    const laterId = '22222222-2222-2222-2222-222222222222'
    state.query.mockImplementation((params: WarehouseAssignmentQuery) => ({
      data: {
        totalCount: 101,
        items: [
          {
            id: params.skip === 100 ? laterId : '11111111-1111-1111-1111-111111111111',
            warehouseCode: params.skip === 100 ? 'W101' : 'W001',
            warehouseName: params.skip === 100 ? 'Kho 101' : 'Kho 1',
            status: 'Active',
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    }))
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Trang sau' }))
    expect(state.query).toHaveBeenLastCalledWith(
      { top: 100, skip: 100, needTotalCount: true, status: 'Active' },
      true
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'W101 - Kho 101' }))
    await userEvent.click(screen.getByRole('button', { name: 'Trang trước' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('W101 - Kho 101')
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
      target: { value: 'person@example.com' },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Gửi lời mời' }))
    await waitFor(() =>
      expect(state.send).toHaveBeenCalledExactlyOnceWith({
        email: 'person@example.com',
        role: USER_ROLES.WarehouseManager,
        warehouseId: laterId,
      })
    )
  }, 15000)

  it('does not allow picking stale page data while the next page loads', () => {
    state.query.mockReturnValue({
      data: { items: [], totalCount: 101 },
      isLoading: false,
      isFetching: true,
      isError: false,
    })
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gửi lời mời' })).toBeDisabled()
  })

  it.each(['loading', 'empty', 'error'] as const)('disables invite in %s state', (mode) => {
    state.query.mockReturnValue({
      data: { items: [] },
      isLoading: mode === 'loading',
      isError: mode === 'error',
      refetch: vi.fn(),
    })
    render(<StaffInvitation canInviteManagers onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Gửi lời mời' })).toBeDisabled()
  })
})
