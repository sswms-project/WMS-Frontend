import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InventoryAbcDirectory } from './InventoryAbcDirectory'

const abcItem = {
  productId: 'product-1',
  sku: 'SKU-01',
  productName: 'Bộ điều khiển',
  totalQuantity: 120,
  cumulativePercentage: 72.5,
  class: 'A',
}

function createProps(
  overrides: Partial<ComponentProps<typeof InventoryAbcDirectory>> = {}
): ComponentProps<typeof InventoryAbcDirectory> {
  return {
    permissions: [],
    items: [],
    warehouseId: '',
    warehouseOptions: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    areWarehousesLoading: false,
    areWarehousesError: false,
    onWarehouseChange: vi.fn(),
    onRetryWarehouses: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  }
}

function renderDirectory(props: ComponentProps<typeof InventoryAbcDirectory>) {
  return render(
    <TooltipProvider>
      <InventoryAbcDirectory {...props} />
    </TooltipProvider>
  )
}

describe('InventoryAbcDirectory', () => {
  it.each([
    ['loading', { isLoading: true }, 'loading'],
    ['error', { isError: true }, 'Không thể tải phân loại ABC'],
    ['empty', {}, 'Chưa có dữ liệu phân loại'],
    ['populated', { items: [abcItem] }, 'Bộ điều khiển'],
  ] as const)('renders %s state', (_, overrides, expected) => {
    renderDirectory(createProps(overrides))
    if (expected === 'loading')
      expect(screen.getByLabelText('Đang tải dữ liệu')).toBeInTheDocument()
    else expect(screen.getAllByText(expected).length).toBeGreaterThan(0)
  })

  it('forwards warehouse filter and refresh', () => {
    const onWarehouseChange = vi.fn()
    const onRetry = vi.fn()
    renderDirectory(
      createProps({
        items: [abcItem],
        warehouseOptions: [{ value: 'warehouse-1', label: 'Kho trung tâm' }],
        onWarehouseChange,
        onRetry,
      })
    )
    fireEvent.change(screen.getByLabelText('Lọc phân loại theo kho'), {
      target: { value: 'warehouse-1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Làm mới phân loại ABC' }))
    expect(onWarehouseChange).toHaveBeenCalledWith('warehouse-1')
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
