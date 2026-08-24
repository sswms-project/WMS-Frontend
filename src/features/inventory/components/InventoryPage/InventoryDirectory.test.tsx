import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InventoryDirectory } from './InventoryDirectory'

const inventoryItem = {
  id: 'balance-1',
  productId: 'product-1',
  sku: 'SKU-01',
  productName: 'Bộ điều khiển nhiệt độ',
  warehouseId: 'warehouse-1',
  warehouseName: 'Kho trung tâm',
  slotId: 'slot-1',
  slotCode: 'A-01-01',
  quantityOnHand: 125.5,
  reservedQuantity: 20,
  availableQuantity: 105.5,
  updatedAt: '2026-08-24T10:00:00+07:00',
}

function createProps(
  overrides: Partial<ComponentProps<typeof InventoryDirectory>> = {}
): ComponentProps<typeof InventoryDirectory> {
  return {
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    searchText: '',
    warehouseId: '',
    productId: '',
    warehouseOptions: [{ value: 'warehouse-1', label: 'WH-01 · Kho trung tâm' }],
    productOptions: [{ value: 'product-1', label: 'SKU-01 · Bộ điều khiển nhiệt độ' }],
    isLoading: false,
    isFetching: false,
    isError: false,
    areFiltersLoading: false,
    areFiltersError: false,
    activeFilterCount: 0,
    onSearchChange: vi.fn(),
    onWarehouseChange: vi.fn(),
    onProductChange: vi.fn(),
    onResetFilters: vi.fn(),
    onRetryFilters: vi.fn(),
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  }
}

function renderDirectory(props: ComponentProps<typeof InventoryDirectory>) {
  return render(
    <TooltipProvider>
      <InventoryDirectory {...props} />
    </TooltipProvider>
  )
}

describe('InventoryDirectory states', () => {
  it.each([
    ['loading', { isLoading: true }, 'loading'],
    ['error', { isError: true }, 'Không thể tải tồn kho'],
    ['empty', {}, 'Không có tồn kho phù hợp'],
    ['populated', { items: [inventoryItem], totalCount: 1 }, 'Bộ điều khiển nhiệt độ'],
  ] as const)('renders the %s state', (_, overrides, expectedText) => {
    renderDirectory(createProps(overrides))
    if (expectedText === 'loading') {
      expect(screen.getByLabelText('Đang tải dữ liệu')).toBeInTheDocument()
    } else {
      expect(screen.getAllByText(expectedText).length).toBeGreaterThan(0)
    }
  })

  it('forwards search, filter, refresh, and pagination interactions', () => {
    const onSearchChange = vi.fn()
    const onWarehouseChange = vi.fn()
    const onProductChange = vi.fn()
    const onRetry = vi.fn()
    const onPageChange = vi.fn()

    renderDirectory(
      createProps({
        items: [inventoryItem],
        totalCount: 21,
        onSearchChange,
        onWarehouseChange,
        onProductChange,
        onRetry,
        onPageChange,
      })
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm sản phẩm tồn kho' }), {
      target: { value: 'SKU-01' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Làm mới tồn kho' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    fireEvent.change(screen.getByLabelText('Kho'), { target: { value: 'warehouse-1' } })
    fireEvent.change(screen.getByLabelText('Sản phẩm'), { target: { value: 'product-1' } })

    expect(onSearchChange).toHaveBeenCalledWith('SKU-01')
    expect(onWarehouseChange).toHaveBeenCalledWith('warehouse-1')
    expect(onProductChange).toHaveBeenCalledWith('product-1')
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
