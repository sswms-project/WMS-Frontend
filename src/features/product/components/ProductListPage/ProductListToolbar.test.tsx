import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProductListToolbar } from './ProductListToolbar'

const baseProps = {
  searchText: '',
  categoryId: '',
  warehouseId: '',
  status: '',
  trackingMode: '',
  categories: [],
  warehouses: [],
  canViewInventory: true,
  isFetching: false,
  onSearchChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onWarehouseChange: vi.fn(),
  onStatusChange: vi.fn(),
  onTrackingModeChange: vi.fn(),
  onRefresh: vi.fn(),
}

describe('ProductListToolbar', () => {
  it('hides warehouse filter without inventory permission', () => {
    render(<ProductListToolbar {...baseProps} canViewInventory={false} />)

    expect(screen.queryByLabelText('Lọc theo kho hàng')).not.toBeInTheDocument()
  })
})
