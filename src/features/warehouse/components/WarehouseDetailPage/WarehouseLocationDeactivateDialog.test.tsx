import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WarehouseLocationDeactivateDialog } from './WarehouseLocationDeactivateDialog'

describe('WarehouseLocationDeactivateDialog', () => {
  it('submits the optional reason and explicit cascade choice', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <WarehouseLocationDeactivateDialog
        open
        locationLabel="Khu vực"
        locationCode="Z01"
        isPending={false}
        errorMessage={null}
        cascadeDescription="Sẽ ngừng 2 kệ và 4 vị trí đang hoạt động."
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />
    )

    await user.click(screen.getByLabelText('Đồng thời ngừng các vị trí con đang hoạt động'))
    await user.type(screen.getByLabelText('Lý do (không bắt buộc)'), 'Sắp xếp lại kho')
    await user.click(screen.getByRole('button', { name: 'Xác nhận ngừng' }))

    expect(onConfirm).toHaveBeenCalledWith('Sắp xếp lại kho', true)
  })

  it('does not offer cascading when reactivating a location', () => {
    render(
      <WarehouseLocationDeactivateDialog
        open
        locationLabel="Kệ hàng"
        locationCode="A01"
        isPending={false}
        errorMessage={null}
        isReactivation
        cascadeDescription="Không được sử dụng khi kích hoạt lại."
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(
      screen.queryByLabelText('Đồng thời ngừng các vị trí con đang hoạt động')
    ).not.toBeInTheDocument()
  })
})
