import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WarehouseCreateDialog } from './WarehouseCreateDialog'

describe('WarehouseCreateDialog', () => {
  it('submits a valid warehouse form through its callback', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(true)

    render(
      <WarehouseCreateDialog open isPending={false} onOpenChange={vi.fn()} onSubmit={onSubmit} />
    )

    await user.type(screen.getByLabelText('Mã kho'), 'HCM-01')
    await user.type(screen.getByLabelText('Tên kho'), 'Kho Thủ Đức')
    await user.type(screen.getByLabelText('Địa chỉ'), 'Thủ Đức, Hồ Chí Minh')
    await user.click(screen.getByRole('button', { name: 'Tạo kho' }))

    expect(onSubmit).toHaveBeenCalledWith({
      warehouseCode: 'HCM-01',
      warehouseName: 'Kho Thủ Đức',
      address: 'Thủ Đức, Hồ Chí Minh',
    })
  })
})
