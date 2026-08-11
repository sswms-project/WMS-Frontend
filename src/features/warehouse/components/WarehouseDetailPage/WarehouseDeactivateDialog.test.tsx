import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WarehouseDeactivateDialog } from './WarehouseDeactivateDialog'

const defaultProps = {
  warehouseName: 'Kho Thủ Đức',
  warehouseCode: 'HCM-01',
  open: true,
  isPending: false,
  errorMessage: null,
  onOpenChange: vi.fn(),
  onConfirm: vi.fn(),
}

describe('WarehouseDeactivateDialog', () => {
  it('identifies the warehouse and requires explicit destructive confirmation', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<WarehouseDeactivateDialog {...defaultProps} onConfirm={onConfirm} />)

    expect(screen.getByRole('alertdialog')).toHaveAccessibleName(
      'Ngừng hoạt động kho “Kho Thủ Đức”?'
    )
    expect(screen.getByText('HCM-01')).toHaveAttribute('translate', 'no')

    await user.click(screen.getByRole('button', { name: 'Xác nhận ngừng hoạt động' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('prevents dismissal and duplicate submission while pending', () => {
    render(<WarehouseDeactivateDialog {...defaultProps} isPending />)

    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toBeDisabled()
  })

  it('renders a backend failure in the dialog context', () => {
    render(
      <WarehouseDeactivateDialog
        {...defaultProps}
        errorMessage="Kho vẫn còn tồn kho và chưa thể ngừng hoạt động."
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Kho vẫn còn tồn kho và chưa thể ngừng hoạt động.'
    )
  })
})
