import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WarehouseEditDialog } from './WarehouseEditDialog'
import type { WarehouseDetailResponse } from '@/types/warehouse'

const warehouse: WarehouseDetailResponse = {
  id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
  warehouseCode: 'HCM-01',
  warehouseName: 'Kho Thủ Đức',
  address: 'Thủ Đức, Hồ Chí Minh',
  status: 'Active',
  zoneCount: 0,
  createdAt: '2026-08-09T00:00:00.000Z',
  modifiedAt: null,
}

describe('WarehouseEditDialog', () => {
  it('submits an empty address to let the API clear the saved address', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(true)

    render(
      <WarehouseEditDialog
        warehouse={warehouse}
        open
        isPending={false}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )

    await user.clear(screen.getByLabelText('Địa chỉ'))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(onSubmit).toHaveBeenCalledWith({
      warehouseName: 'Kho Thủ Đức',
      address: '',
    })
  })
})
