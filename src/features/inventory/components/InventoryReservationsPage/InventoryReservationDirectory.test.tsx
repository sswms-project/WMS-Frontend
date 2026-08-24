import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InventoryReservationDirectory } from './InventoryReservationDirectory'

const reservation = {
  id: 'balance-1',
  productId: 'product-1',
  sku: 'SKU-01',
  productName: 'Bộ điều khiển',
  warehouseId: 'warehouse-1',
  warehouseName: 'Kho trung tâm',
  slotId: 'slot-1',
  slotCode: 'A-01',
  quantityOnHand: 20,
  reservedQuantity: 5,
  availableQuantity: 15,
  updatedAt: '2026-08-24T10:00:00+07:00',
}

function createProps(
  overrides: Partial<ComponentProps<typeof InventoryReservationDirectory>> = {}
): ComponentProps<typeof InventoryReservationDirectory> {
  return {
    items: [],
    warehouseId: '',
    productId: '',
    warehouseOptions: [],
    productOptions: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    areFiltersLoading: false,
    areFiltersError: false,
    activeFilterCount: 0,
    canRelease: false,
    onWarehouseChange: vi.fn(),
    onProductChange: vi.fn(),
    onResetFilters: vi.fn(),
    onRetryFilters: vi.fn(),
    onRetry: vi.fn(),
    onRelease: vi.fn(),
    ...overrides,
  }
}

function renderDirectory(props: ComponentProps<typeof InventoryReservationDirectory>) {
  return render(
    <TooltipProvider>
      <InventoryReservationDirectory {...props} />
    </TooltipProvider>
  )
}

describe('InventoryReservationDirectory', () => {
  it.each([
    ['loading', { isLoading: true }, 'loading'],
    ['error', { isError: true }, 'Không thể tải tồn đang giữ'],
    ['empty', {}, 'Không có tồn đang giữ phù hợp'],
    ['populated', { items: [reservation] }, 'Bộ điều khiển'],
  ] as const)('renders %s state', (_, overrides, expected) => {
    renderDirectory(createProps(overrides))
    if (expected === 'loading')
      expect(screen.getByLabelText('Đang tải dữ liệu')).toBeInTheDocument()
    else expect(screen.getAllByText(expected).length).toBeGreaterThan(0)
  })

  it('forwards refresh and filters', () => {
    const onRetry = vi.fn()
    const onWarehouseChange = vi.fn()
    renderDirectory(
      createProps({
        items: [reservation],
        warehouseOptions: [{ value: 'warehouse-1', label: 'Kho trung tâm' }],
        onRetry,
        onWarehouseChange,
      })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Làm mới tồn đang giữ' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    fireEvent.change(screen.getByLabelText('Kho'), { target: { value: 'warehouse-1' } })
    expect(onRetry).toHaveBeenCalledOnce()
    expect(onWarehouseChange).toHaveBeenCalledWith('warehouse-1')
  })

  it('only exposes release action with inventory reserve permission', () => {
    const onRelease = vi.fn()
    renderDirectory(createProps({ items: [reservation], canRelease: true, onRelease }))
    const [releaseButton] = screen.getAllByRole('button', { name: 'Giải phóng' })
    expect(releaseButton).toBeDefined()
    if (!releaseButton) return
    fireEvent.click(releaseButton)
    expect(onRelease).toHaveBeenCalledWith(reservation)
  })
})
