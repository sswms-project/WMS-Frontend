import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForecastRunPanel } from './ForecastRunPanel'

const state = vi.hoisted(() => ({
  acceptReplenishment: vi.fn(),
  rejectSuggestion: vi.fn(),
  toastError: vi.fn(),
  loggerError: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: state.toastError },
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: state.loggerError },
}))

vi.mock('@/features/product/hooks/use-products', () => ({
  useProductSuppliersQuery: () => ({
    data: [
      {
        id: 'link-active',
        supplierId: 'supplier-active',
        supplierName: 'Nhà cung cấp đang hoạt động',
        supplierStatus: 'Active',
      },
      {
        id: 'link-inactive',
        supplierId: 'supplier-inactive',
        supplierName: 'Nhà cung cấp đã ngừng',
        supplierStatus: 'Inactive',
      },
    ],
  }),
}))

vi.mock('@/features/warehouse/hooks/use-warehouse', () => ({
  useWarehouseLocationsQuery: () => ({ data: { items: [] } }),
}))

vi.mock('../../hooks/use-inventory', () => ({
  useCreateForecastRunMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useExecuteForecastRunMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useForecastRunQuery: () => ({
    data: {
      id: 'run-1',
      warehouseId: 'warehouse-1',
      warehouseName: 'Kho trung tâm',
      createdByUserId: 'user-1',
      createdByName: 'Chủ đơn vị',
      method: 'Linear',
      historicalPeriodDays: 90,
      forecastStartDate: '2026-09-17',
      forecastEndDate: '2026-09-30',
      status: 'Completed',
      failureReason: null,
      completedAt: '2026-09-16T08:00:00Z',
      createdAt: '2026-09-16T07:00:00Z',
      results: [],
      replenishmentSuggestions: [
        {
          id: 'suggestion-1',
          productId: 'product-1',
          sku: 'SKU-01',
          productName: 'Sản phẩm A',
          warehouseId: 'warehouse-1',
          suggestedQuantity: 10,
          adjustedQuantity: null,
          status: 'New',
          purchaseOrderId: null,
          acceptedByUserId: null,
          acceptedAt: null,
        },
      ],
      rebalancingSuggestions: [],
    },
  }),
  useEvaluateForecastRunMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useAcceptReplenishmentSuggestionMutation: () => ({
    isPending: false,
    mutate: state.acceptReplenishment,
  }),
  useAcceptRebalancingSuggestionMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useRejectForecastSuggestionMutation: () => ({ mutate: state.rejectSuggestion }),
}))

describe('ForecastRunPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('offers only active suppliers linked to the selected product', async () => {
    render(
      <ForecastRunPanel
        warehouseOptions={[{ value: 'warehouse-1', label: 'Kho trung tâm' }]}
        permissions={['purchase-orders:create']}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Chấp nhận' }))

    expect(screen.getByRole('option', { name: 'Nhà cung cấp đang hoạt động' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Nhà cung cấp đã ngừng' })).not.toBeInTheDocument()
  })

  it('blocks non-positive adjusted quantities before accepting a suggestion', async () => {
    render(
      <ForecastRunPanel
        warehouseOptions={[{ value: 'warehouse-1', label: 'Kho trung tâm' }]}
        permissions={['purchase-orders:create']}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Chấp nhận' }))
    await userEvent.selectOptions(
      screen.getByLabelText('Nhà cung cấp cho đề xuất bổ sung'),
      'supplier-active'
    )

    fireEvent.change(screen.getByLabelText('Số lượng bổ sung điều chỉnh'), {
      target: { value: '0' },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Số lượng điều chỉnh phải lớn hơn 0.')
    expect(screen.getByRole('button', { name: 'Tạo đơn mua' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Số lượng bổ sung điều chỉnh'), {
      target: { value: '7.5' },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Tạo đơn mua' }))
    expect(state.acceptReplenishment).toHaveBeenCalledWith(
      {
        id: 'suggestion-1',
        request: { supplierId: 'supplier-active', adjustedQuantity: 7.5 },
      },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    )
  })

  it('shows the normalized backend failure when acceptance is rejected', async () => {
    render(
      <ForecastRunPanel
        warehouseOptions={[{ value: 'warehouse-1', label: 'Kho trung tâm' }]}
        permissions={['purchase-orders:create']}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Chấp nhận' }))
    await userEvent.selectOptions(
      screen.getByLabelText('Nhà cung cấp cho đề xuất bổ sung'),
      'supplier-active'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tạo đơn mua' }))

    const callbacks = state.acceptReplenishment.mock.calls[0]?.[1]
    act(() =>
      callbacks?.onError({
        statusCode: 409,
        message: 'Đề xuất đã được xử lý',
      })
    )

    expect(state.toastError).toHaveBeenCalledWith('Đề xuất đã được xử lý')
    expect(state.loggerError).toHaveBeenCalledWith('[409] Đề xuất đã được xử lý')
  })
})
