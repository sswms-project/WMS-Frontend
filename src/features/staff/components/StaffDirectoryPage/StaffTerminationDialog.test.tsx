import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StaffTerminationDialog } from './StaffTerminationDialog'

const person = {
  id: 'staff-1',
  fullName: 'Nguyễn Văn A',
  email: 'staff@example.com',
  phone: null,
  role: 'Warehouse Staff',
  status: 'Active',
  lastLoginAt: null,
  assignedWarehouseIds: ['warehouse-1'],
}

describe('StaffTerminationDialog', () => {
  it('explains the permanent access removal and confirms explicitly', () => {
    const onConfirm = vi.fn()
    render(
      <StaffTerminationDialog
        person={person}
        isPending={false}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByRole('alertdialog', { name: 'Chấm dứt làm việc' })).toBeInTheDocument()
    expect(screen.getByText(person.fullName)).toBeInTheDocument()
    expect(screen.getByText(person.email)).toBeInTheDocument()
    expect(screen.getByText('Tất cả phiên đăng nhập bị thu hồi.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận chấm dứt' }))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('does not close or submit while the request is pending', () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()
    render(
      <StaffTerminationDialog
        person={person}
        isPending
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Xác nhận chấm dứt' })).toBeDisabled()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
