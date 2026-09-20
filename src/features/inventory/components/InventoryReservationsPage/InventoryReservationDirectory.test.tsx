import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InventoryReservationDirectory } from './InventoryReservationDirectory'

const reservation = {
  id: 'reservation-1',
  inventoryStockId: 'stock-1',
  productId: 'product-1',
  productSku: 'SKU-001',
  productName: 'Pin AA',
  warehouseId: 'warehouse-1',
  warehouseCode: 'WH-001',
  warehouseName: 'Kho trung tâm',
  slotId: 'slot-1',
  slotCode: 'A-01-01',
  lotId: null,
  lotNumber: null,
  qualityStatus: 'Good' as const,
  referenceType: 'StockIssuePick' as const,
  referenceId: 'pick-1',
  referenceCode: 'SO-001',
  reservedQuantity: 5,
  status: 'Active' as const,
  createdByUserId: 'user-1',
  createdByName: 'Nguyễn Văn A',
  releasedAt: null,
  createdAt: '2026-08-24T10:00:00+07:00',
}

function createProps(
  overrides: Partial<ComponentProps<typeof InventoryReservationDirectory>> = {}
): ComponentProps<typeof InventoryReservationDirectory> {
  return {
    permissions: [],
    items: [],
    warehouseId: '',
    productId: '',
    status: 'Active',
    warehouseOptions: [],
    productOptions: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    areFiltersLoading: false,
    areFiltersError: false,
    activeFilterCount: 0,
    onWarehouseChange: vi.fn(),
    onProductChange: vi.fn(),
    onStatusChange: vi.fn(),
    onResetFilters: vi.fn(),
    onRetryFilters: vi.fn(),
    onRetry: vi.fn(),
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
    ['error', { isError: true }, 'Không thể tải lịch sử giữ hàng'],
    ['empty', {}, 'Không có dữ liệu phù hợp'],
    ['populated', { items: [reservation] }, 'Lấy hàng xuất kho'],
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
    fireEvent.click(screen.getByRole('button', { name: 'Làm mới lịch sử giữ hàng' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    fireEvent.change(screen.getByLabelText('Kho'), { target: { value: 'warehouse-1' } })
    expect(onRetry).toHaveBeenCalledOnce()
    expect(onWarehouseChange).toHaveBeenCalledWith('warehouse-1')
  })

  it('forwards reservation status filters', () => {
    const onStatusChange = vi.fn()
    renderDirectory(createProps({ onStatusChange }))
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'Consumed' } })
    expect(onStatusChange).toHaveBeenCalledWith('Consumed')
  })
})
