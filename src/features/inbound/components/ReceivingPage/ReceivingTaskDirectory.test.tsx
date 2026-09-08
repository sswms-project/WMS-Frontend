import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ReceivingTask } from '../../types/inbound.types'
import { ReceivingTaskDirectory } from './ReceivingTaskDirectory'

const receivingTask: ReceivingTask = {
  purchaseOrderId: '58f22fa2-de73-4eab-878e-08df0b58ac68',
  poNumber: 'PO-20260905141918-A4569F3D',
  warehouseId: '398483fe-ddf6-4719-dc77-08df069816ab',
  warehouseName: 'Kho Kovia',
  supplierId: '4e159df0-fbee-4cff-9a62-7255aecb1ae6',
  supplierName: 'CÔNG TY TNHH CUNG ỨNG MINH AN',
  expectedDate: '2026-09-05T00:00:00+07:00',
  orderedQuantity: 62,
  receivedQuantity: 0,
  remainingQuantity: 62,
  activeDocumentImportId: 'defc84ca-7b5b-4050-99e6-61e6bd95fc73',
  lines: [],
}

describe('ReceivingTaskDirectory', () => {
  it('resumes the active document import from the receiving task', () => {
    const onImportDocument = vi.fn()

    render(
      <TooltipProvider>
        <ReceivingTaskDirectory
          items={[receivingTask]}
          totalCount={1}
          page={1}
          pageSize={10}
          searchText=""
          isLoading={false}
          isFetching={false}
          isError={false}
          onSearchChange={vi.fn()}
          onPageChange={vi.fn()}
          onReceive={vi.fn()}
          onImportDocument={onImportDocument}
          onRetry={vi.fn()}
        />
      </TooltipProvider>
    )

    const resumeButtons = screen.getAllByRole('button', { name: 'Tiếp tục chứng từ' })

    expect(screen.queryByRole('button', { name: 'Nhập từ chứng từ' })).not.toBeInTheDocument()
    expect(resumeButtons).toHaveLength(2)
    fireEvent.click(resumeButtons[0]!)
    expect(onImportDocument).toHaveBeenCalledWith(receivingTask)
  })

  it('labels a new document import without an icon', () => {
    render(
      <TooltipProvider>
        <ReceivingTaskDirectory
          items={[{ ...receivingTask, activeDocumentImportId: null }]}
          totalCount={1}
          page={1}
          pageSize={10}
          searchText=""
          isLoading={false}
          isFetching={false}
          isError={false}
          onSearchChange={vi.fn()}
          onPageChange={vi.fn()}
          onReceive={vi.fn()}
          onImportDocument={vi.fn()}
          onRetry={vi.fn()}
        />
      </TooltipProvider>
    )

    const importButtons = screen.getAllByRole('button', { name: 'Nhập từ chứng từ' })

    expect(importButtons).toHaveLength(2)
    expect(importButtons.every((button) => button.querySelector('svg') === null)).toBe(true)
  })
})
