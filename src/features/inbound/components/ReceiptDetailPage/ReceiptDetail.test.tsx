import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { InboundReceiptDetail } from '../../types/inbound.types'
import { ReceiptDetail } from './ReceiptDetail'

const receipt: InboundReceiptDetail = {
  id: 'a7af68ae-91c8-4d1d-bff6-f175f20b6dcc',
  receiptCode: 'GRN-001',
  purchaseOrderId: 'bd489a5d-7b0a-4eaf-b46d-760ad208175f',
  poNumber: 'PO-001',
  warehouseId: '68dbb086-912a-4c87-91f7-079beb836d14',
  warehouseCode: 'WH-01',
  warehouseName: 'Kho trung tâm',
  status: 'Draft',
  createdBy: 'c66fa09f-9bf4-444e-95cc-01ed11a1b6d5',
  createdByName: 'Người nhận hàng',
  approvedBy: null,
  approvedByName: null,
  createdAt: '2026-08-24T07:00:00Z',
  modifiedAt: null,
  submittedAt: null,
  approvedAt: null,
  rejectionReason: null,
  items: [],
  history: [],
}

describe('ReceiptDetail', () => {
  it('offers the update action for an editable draft receipt', () => {
    const onUpdate = vi.fn()

    render(
      <ReceiptDetail
        receipt={receipt}
        allowedActions={['Update']}
        isPending={false}
        onUpdate={onUpdate}
        onSubmit={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }))

    expect(onUpdate).toHaveBeenCalledOnce()
  })
})
