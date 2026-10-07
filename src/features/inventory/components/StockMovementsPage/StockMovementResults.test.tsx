import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { StockMovement } from '../../types/inventory.types'
import { StockMovementDesktopTable, StockMovementMobileList } from './StockMovementResults'

const movement: StockMovement = {
  id: 'movement-1',
  productId: 'product-1',
  sku: 'BEER',
  productName: 'Bia Tiger',
  slotId: 'slot-1',
  slotCode: '__SYSTEM_DEFAULT__',
  isSystemDefaultSlot: true,
  warehouseName: 'Kho Đà Nẵng',
  zoneCode: 'Z01',
  rackCode: 'R01',
  lotId: null,
  lotNumber: null,
  qualityStatus: 'Good',
  eligibilityStatus: 'Available',
  quantityChange: 40,
  balanceAfter: 40,
  unitName: 'Thùng',
  movementType: 'PutAway',
  referenceType: 'GoodsReceiptItem',
  referenceId: 'receipt-item-id',
  referenceCode: 'PN001',
  correctsMovementId: null,
  correctionReason: null,
  performedByUserId: 'staff-1',
  performedByName: 'Warehouse Staff',
  occurredAt: '2026-10-05T10:00:00Z',
  createdAt: '2026-10-05T10:00:00Z',
}

describe('stock movement results', () => {
  it.each([StockMovementDesktopTable, StockMovementMobileList])(
    'uses readable locations, Vietnamese labels and units in %s',
    (Component) => {
      render(<Component items={[movement]} />)
      expect(screen.getByText('+40 Thùng')).toBeInTheDocument()
      expect(screen.getByText(/Phiếu nhận hàng/)).toBeInTheDocument()
      expect(screen.getByText(/PN001/)).toBeInTheDocument()
      expect(screen.getByText(/Tốt/)).toBeInTheDocument()
      expect(screen.getByText(/Khu vực Z01 \/ Kệ R01/)).toBeInTheDocument()
      expect(screen.queryByText('__SYSTEM_DEFAULT__')).not.toBeInTheDocument()
      expect(screen.queryByText('Good')).not.toBeInTheDocument()
      expect(screen.queryByText('GoodsReceiptItem')).not.toBeInTheDocument()
      expect(screen.getByText(/Warehouse Staff/)).toBeInTheDocument()
    }
  )
  it('keeps negative movements and exposes full long location labels', () => {
    render(
      <StockMovementDesktopTable
        items={[{ ...movement, quantityChange: -2, qualityStatus: 'Damaged' }]}
      />
    )
    expect(screen.getByText('-2 Thùng')).toBeInTheDocument()
    expect(screen.getByText('Hư hỏng')).toBeInTheDocument()
    expect(screen.getByTitle('Khu vực Z01 / Kệ R01')).toBeInTheDocument()
  })
})
