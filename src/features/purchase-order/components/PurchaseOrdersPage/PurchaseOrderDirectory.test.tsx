import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { PurchaseOrderSummary } from '../../types/purchase-order.types'
import { PurchaseOrderDirectory } from './PurchaseOrderDirectory'

const purchaseOrder: PurchaseOrderSummary = {
  id: 'af859ca6-dc0f-42ee-9eb3-08df01a537f2',
  poNumber: 'PO-20260824060202-6F928636-EXTRA-LONG-IDENTIFIER',
  warehouseId: '111f3ff3-d0b1-4120-209e-08defd3c2689',
  warehouseCode: 'NHS-01',
  warehouseName: 'Kho Đà Nẵng',
  supplierId: '0117563f-f22e-4f90-a3b7-a40ea8e316b6',
  supplierName: 'Nhà cung cấp QA WMS-177',
  status: 'Received',
  createdBy: 'fbd82b4d-c21d-8c54-5fa0-678de8a4760d',
  createdByName: 'Warehouse Manager Demo',
  expectedDate: '2026-08-31T13:02:01.9013003+07:00',
  createdAt: '2026-08-24T13:02:01.9013003+07:00',
  lineCount: 1,
  orderedQuantity: 6,
  receivedQuantity: 6,
}

describe('PurchaseOrderDirectory', () => {
  it('contains long PO identifiers within the desktop table cell', () => {
    render(
      <TooltipProvider>
        <PurchaseOrderDirectory
          items={[purchaseOrder]}
          totalCount={1}
          page={1}
          pageSize={10}
          searchText=""
          status=""
          isLoading={false}
          isFetching={false}
          isError={false}
          onSearchChange={vi.fn()}
          onStatusChange={vi.fn()}
          onPageChange={vi.fn()}
          onRetry={vi.fn()}
        />
      </TooltipProvider>
    )

    const table = screen.getByRole('table')
    const poLink = within(table).getByRole('link', { name: purchaseOrder.poNumber })

    expect(table).toHaveClass('min-w-[1120px]', 'table-fixed')
    expect(within(table).getByRole('columnheader', { name: 'Mã PO' })).toHaveClass('w-64')
    expect(poLink).toHaveClass('block', 'truncate')
    expect(poLink).toHaveAttribute('translate', 'no')
    expect(poLink.closest('td')).toHaveClass('min-w-0')
  })
})
