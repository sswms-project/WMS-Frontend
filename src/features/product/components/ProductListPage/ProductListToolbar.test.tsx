import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProductListToolbar } from './ProductListToolbar'

describe('ProductListToolbar', () => {
  it('forwards warehouse, category, tracking, and status filters', async () => {
    const user = userEvent.setup()
    const onWarehouseChange = vi.fn()
    const onCategoryChange = vi.fn()
    const onTrackingModeChange = vi.fn()
    const onStatusChange = vi.fn()

    render(
      <ProductListToolbar
        searchText=""
        warehouseId=""
        categoryId=""
        trackingMode=""
        status=""
        warehouses={[
          {
            id: 'warehouse-1',
            warehouseCode: 'DN-01',
            warehouseName: 'Kho Đà Nẵng',
            address: null,
            status: 'Active',
            createdAt: '2026-09-24T00:00:00Z',
          },
        ]}
        categories={[
          {
            id: 'category-1',
            parentCategoryId: null,
            categoryCode: 'NGK',
            categoryName: 'Ngũ kim',
            description: null,
            status: 'Active',
            level: 1,
            categoryPath: 'Ngũ kim',
            hasChildren: false,
            createdAt: '2026-09-24T00:00:00Z',
            modifiedAt: null,
          },
        ]}
        isFetching={false}
        onSearchChange={vi.fn()}
        onWarehouseChange={onWarehouseChange}
        onCategoryChange={onCategoryChange}
        onTrackingModeChange={onTrackingModeChange}
        onStatusChange={onStatusChange}
        onRefresh={vi.fn()}
      />
    )

    await user.selectOptions(screen.getByLabelText('Lọc theo kho hàng'), 'warehouse-1')
    await user.selectOptions(screen.getByLabelText('Lọc theo nhóm vật tư hàng hóa'), 'category-1')
    await user.selectOptions(screen.getByLabelText('Lọc theo phương thức quản lý'), 'lot')
    await user.selectOptions(screen.getByLabelText('Lọc theo trạng thái'), 'Inactive')

    expect(onWarehouseChange).toHaveBeenCalledWith('warehouse-1')
    expect(onCategoryChange).toHaveBeenCalledWith('category-1')
    expect(onTrackingModeChange).toHaveBeenCalledWith('lot')
    expect(onStatusChange).toHaveBeenCalledWith('Inactive')
  })
})
