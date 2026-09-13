import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { InventoryForecastDirectory } from './InventoryForecastDirectory'

function createProps(
  overrides: Partial<ComponentProps<typeof InventoryForecastDirectory>> = {}
): ComponentProps<typeof InventoryForecastDirectory> {
  return {
    permissions: [],
    productId: '',
    productOptions: [],
    warehouseId: '',
    warehouseOptions: [],
    horizonDays: 14,
    chartData: [],
    modelName: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    areProductsLoading: false,
    areWarehousesLoading: false,
    onProductChange: vi.fn(),
    onWarehouseChange: vi.fn(),
    onHorizonChange: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  }
}

describe('InventoryForecastDirectory', () => {
  it('prompts for a product when none is selected', () => {
    render(<InventoryForecastDirectory {...createProps()} />)
    expect(screen.getByText('Chưa chọn sản phẩm')).toBeInTheDocument()
  })

  it('shows the loading state while fetching', () => {
    render(
      <InventoryForecastDirectory {...createProps({ productId: 'product-1', isLoading: true })} />
    )
    expect(screen.getByLabelText('Đang tải dữ liệu')).toBeInTheDocument()
  })

  it('shows the error state with a retry action', () => {
    const onRetry = vi.fn()
    render(
      <InventoryForecastDirectory
        {...createProps({ productId: 'product-1', isError: true, onRetry })}
      />
    )
    expect(screen.getByText('Không thể tải dự báo tồn kho')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows the empty state when there is no chart data', () => {
    render(
      <InventoryForecastDirectory {...createProps({ productId: 'product-1', chartData: [] })} />
    )
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
  })

  it('renders the model name once a forecast is loaded', () => {
    render(
      <InventoryForecastDirectory
        {...createProps({
          productId: 'product-1',
          modelName: 'linear-trend-baseline',
          chartData: [{ date: '2026-08-01', actual: 100, forecast: null }],
        })}
      />
    )
    expect(screen.getByText('Mô hình: linear-trend-baseline')).toBeInTheDocument()
  })

  it('forwards product, warehouse and horizon selection changes', () => {
    const onProductChange = vi.fn()
    const onWarehouseChange = vi.fn()
    const onHorizonChange = vi.fn()
    render(
      <InventoryForecastDirectory
        {...createProps({
          productOptions: [{ value: 'product-1', label: 'SKU-01 · Bộ điều khiển' }],
          warehouseOptions: [{ value: 'warehouse-1', label: 'Kho trung tâm' }],
          onProductChange,
          onWarehouseChange,
          onHorizonChange,
        })}
      />
    )

    fireEvent.change(screen.getByLabelText('Chọn sản phẩm'), { target: { value: 'product-1' } })
    fireEvent.change(screen.getByLabelText('Lọc dự báo theo kho'), {
      target: { value: 'warehouse-1' },
    })
    fireEvent.change(screen.getByLabelText('Số ngày dự báo'), { target: { value: '30' } })

    expect(onProductChange).toHaveBeenCalledWith('product-1')
    expect(onWarehouseChange).toHaveBeenCalledWith('warehouse-1')
    expect(onHorizonChange).toHaveBeenCalledWith(30)
  })
})
