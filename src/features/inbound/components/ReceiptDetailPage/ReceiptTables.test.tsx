import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { GoodsReceiptItem } from '../../types/inbound.types'
import { ReceiptItemsTable } from './ReceiptItemsTable'
import { ReceiptPutAwayTable } from './ReceiptPutAwayTable'
import { ReceiptHistorySheet } from './ReceiptHistorySheet'

const item: GoodsReceiptItem = {
  id: 'item',
  inboundRequestItemId: 'request-item',
  productId: 'beer',
  productSKU: 'BEER',
  productName: 'Bia',
  baseUnitId: 'can',
  baseUnitName: 'Lon',
  enteredUnitId: 'carton',
  enteredUnitName: 'Thùng',
  conversionFactorSnapshot: 24,
  allowedUnits: [],
  lotId: null,
  lotNumber: null,
  manufacturedDate: null,
  expiryDate: null,
  orderedQuantity: 240,
  receivedQuantity: 240,
  damagedQuantity: 0,
  usableQuantity: 240,
  putAwayQuantity: 96,
  remainingPutAwayQuantity: 144,
  exceptionReason: null,
  putAwayDetails: [
    {
      id: 'putaway',
      inventoryStockId: 'stock',
      stockMovementId: 'movement',
      warehouseId: 'warehouse',
      slotId: 'slot',
      slotCode: '__SYSTEM_DEFAULT__',
      rackCode: 'KE-01',
      isSystemDefaultSlot: true,
      lotId: null,
      lotNumber: null,
      qualityStatus: 'Good',
      performedByUserId: 'staff',
      performedByName: 'Nhân viên',
      quantity: 96,
      putAwayAt: '2026-10-04T00:00:00Z',
    },
  ],
}

afterEach(cleanup)

describe('receipt units and Vietnamese history', () => {
  it('shows base and snapshot conversion even when the entered unit is no longer selectable', () => {
    render(<ReceiptItemsTable items={[item]} />)
    expect(screen.getByRole('columnheader', { name: 'Theo yêu cầu nhập' })).toBeInTheDocument()
    expect(screen.getByText('1 Thùng = 24 Lon')).toBeInTheDocument()
    expect(screen.queryByText('Theo PO')).not.toBeInTheDocument()
  })
  it('labels historical conversion rather than pretending to know the originally entered unit', () => {
    render(<ReceiptPutAwayTable items={[item]} />)
    expect(
      screen.getByRole('columnheader', { name: 'Quy đổi theo yêu cầu nhập' })
    ).toBeInTheDocument()
    expect(screen.getByText('4 Thùng (1 Thùng = 24 Lon)')).toBeInTheDocument()
    expect(screen.getByText('96 Lon')).toBeInTheDocument()
    expect(screen.getByText('Đạt')).toBeInTheDocument()
    expect(screen.getByText('Kệ KE-01 (không chia ô)')).toBeInTheDocument()
    expect(screen.queryByText('__SYSTEM_DEFAULT__')).not.toBeInTheDocument()
  })
  it('translates current inspection workflow actions', async () => {
    const actions = [
      'ApproveInspection',
      'SelfApproveInspection',
      'ReturnInspectionForCorrection',
      'ResubmitInspection',
      'CreatePutAwayTask',
    ]
    render(
      <ReceiptHistorySheet
        receiptCode="GR-001"
        events={actions.map((action) => ({
          action,
          fromState: null,
          toState: null,
          actorId: 'manager',
          actorName: 'Quản lý',
          reason: null,
          createdAt: '2026-10-04T00:00:00Z',
        }))}
      />
    )
    await userEvent.setup().click(screen.getByRole('button', { name: 'Xem lịch sử xử lý' }))
    for (const action of actions) expect(screen.queryByText(action)).not.toBeInTheDocument()
    expect(screen.getByText('Duyệt kết quả kiểm hàng')).toBeInTheDocument()
    expect(screen.getByText('Gửi lại kết quả kiểm hàng')).toBeInTheDocument()
  })
})
