import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ProductLot, ProductWarehousePolicy } from '../../types/product.types'
import { ProductLotsPanel } from './ProductLotsPanel'
import { ProductWarehousePoliciesPanel } from './ProductWarehousePoliciesPanel'

const lot: ProductLot = {
  id: 'lot-1',
  productId: 'product-1',
  lotNumber: 'LOT-2026-01',
  supplierId: null,
  supplierName: null,
  manufacturedDate: null,
  expiryDate: null,
  status: 'Active',
  quantityOnHand: 20,
  reservedQuantity: 5,
  availableQuantity: 15,
}

const policy: ProductWarehousePolicy = {
  id: 'policy-1',
  productId: 'product-1',
  warehouseId: 'warehouse-1',
  warehouseCode: 'WH-01',
  warehouseName: 'Kho trung tâm',
  minStockThreshold: 10,
  maxStockThreshold: 100,
  reorderPoint: 20,
  safetyStock: 5,
  leadTimeDays: 3,
  abcClass: 'A',
  abcClassifiedAt: null,
  createdAt: '2026-09-16T00:00:00Z',
  modifiedAt: null,
}

describe('product inventory panels', () => {
  it('forwards lot filters and status actions', async () => {
    const onWarehouseChange = vi.fn()
    const onBlock = vi.fn()
    render(
      <ProductLotsPanel
        lots={[lot]}
        warehouses={[
          {
            id: 'warehouse-1',
            warehouseCode: 'WH-01',
            warehouseName: 'Kho trung tâm',
            address: null,
            status: 'Active',
            createdAt: '2026-09-16T00:00:00Z',
          },
        ]}
        warehouseId=""
        status=""
        onlyAvailable={false}
        expiresOnOrBefore=""
        isLoading={false}
        isError={false}
        isUpdating={false}
        canBlock
        canUnlock
        impact={null}
        isImpactLoading={false}
        onWarehouseChange={onWarehouseChange}
        onStatusChange={vi.fn()}
        onOnlyAvailableChange={vi.fn()}
        onExpiryChange={vi.fn()}
        onRetry={vi.fn()}
        onInspectImpact={vi.fn()}
        onBlock={onBlock}
        onUnlock={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText('Kho'), { target: { value: 'warehouse-1' } })
    await userEvent.click(screen.getByRole('button', { name: 'Khóa lô' }))
    await userEvent.type(screen.getByLabelText('Lý do thao tác lô'), 'Lỗi kiểm tra chất lượng')
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Khóa lô' })
    )

    expect(onWarehouseChange).toHaveBeenCalledWith('warehouse-1')
    expect(onBlock).toHaveBeenCalledWith(lot, 'Lỗi kiểm tra chất lượng')
  })

  it('keeps policy configuration hidden without management permission', () => {
    const { rerender } = render(
      <ProductWarehousePoliciesPanel
        policies={[policy]}
        isLoading={false}
        isError={false}
        canManage={false}
        onRetry={vi.fn()}
        onConfigure={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: 'Cấu hình' })).not.toBeInTheDocument()

    rerender(
      <ProductWarehousePoliciesPanel
        policies={[policy]}
        isLoading={false}
        isError={false}
        canManage
        onRetry={vi.fn()}
        onConfigure={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Cấu hình' })).toBeInTheDocument()
  })
})
