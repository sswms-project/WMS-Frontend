import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { StockMovementHistory } from './StockMovementHistory'

const movement = {
  id: 'movement-1',
  productId: 'product-1',
  sku: 'SKU-01',
  productName: 'Bộ điều khiển nhiệt độ',
  slotId: 'slot-1',
  slotCode: 'A-01-01',
  quantity: -4.5,
  movementType: 'Outbound',
  referenceType: 'OutboundOrder',
  referenceId: '12345678-1234-1234-1234-123456789abc',
  createdBy: 'user-1',
  createdByName: 'Nguyễn Văn Kho',
  createdAt: '2026-08-24T10:00:00+07:00',
}

function createProps(
  overrides: Partial<ComponentProps<typeof StockMovementHistory>> = {}
): ComponentProps<typeof StockMovementHistory> {
  return {
    permissions: [],
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    productId: '',
    movementType: '',
    dateFrom: '',
    dateTo: '',
    productOptions: [{ value: 'product-1', label: 'SKU-01 · Bộ điều khiển nhiệt độ' }],
    isLoading: false,
    isFetching: false,
    isError: false,
    isDateRangeValid: true,
    areProductsLoading: false,
    areProductsError: false,
    activeFilterCount: 0,
    onProductChange: vi.fn(),
    onMovementTypeChange: vi.fn(),
    onDateFromChange: vi.fn(),
    onDateToChange: vi.fn(),
    onResetFilters: vi.fn(),
    onRetryProducts: vi.fn(),
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  }
}

function renderHistory(props: ComponentProps<typeof StockMovementHistory>) {
  return render(
    <TooltipProvider>
      <StockMovementHistory {...props} />
    </TooltipProvider>
  )
}

describe('StockMovementHistory states', () => {
  it.each([
    ['loading', { isLoading: true }, 'loading'],
    ['error', { isError: true }, 'Không thể tải lịch sử biến động'],
    ['empty', {}, 'Không có biến động phù hợp'],
    ['invalid date', { isDateRangeValid: false }, 'Khoảng thời gian không hợp lệ'],
    ['populated', { items: [movement], totalCount: 1 }, 'Bộ điều khiển nhiệt độ'],
  ] as const)('renders the %s state', (_, overrides, expectedText) => {
    renderHistory(createProps(overrides))
    if (expectedText === 'loading') {
      expect(screen.getByLabelText('Đang tải dữ liệu')).toBeInTheDocument()
    } else {
      expect(screen.getAllByText(expectedText).length).toBeGreaterThan(0)
    }
  })

  it('forwards refresh, pagination, and filters', () => {
    const onRetry = vi.fn()
    const onPageChange = vi.fn()
    const onProductChange = vi.fn()
    const onMovementTypeChange = vi.fn()
    renderHistory(
      createProps({
        items: [movement],
        totalCount: 21,
        onRetry,
        onPageChange,
        onProductChange,
        onMovementTypeChange,
      })
    )

    fireEvent.click(screen.getByRole('button', { name: 'Làm mới lịch sử biến động' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    fireEvent.change(screen.getByLabelText('Sản phẩm'), { target: { value: 'product-1' } })
    fireEvent.change(screen.getByLabelText('Loại biến động'), { target: { value: 'Inbound' } })

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(onProductChange).toHaveBeenCalledWith('product-1')
    expect(onMovementTypeChange).toHaveBeenCalledWith('Inbound')
  })
})
