import { describe, expect, it } from 'vitest'
import { formatInventoryLocation } from './inventory-format'
import { formatStockMovementReference } from './stock-movement-format'

describe('inventory location labels', () => {
  it('shows a rack-managed location without its technical slot code', () => {
    expect(
      formatInventoryLocation({
        slotCode: '__SYSTEM_DEFAULT__',
        rackCode: 'R01',
        zoneCode: 'Z01',
        isSystemDefaultSlot: true,
      })
    ).toBe('Khu vực Z01 / Kệ R01')
  })
  it('distinguishes manually created slots inside a rack', () => {
    expect(formatInventoryLocation({ slotCode: 'A01', rackCode: 'R01', zoneCode: 'Z01' })).toBe(
      'Khu vực Z01 / Kệ R01 / A01'
    )
  })
  it('does not expose technical codes from an older API response', () => {
    expect(formatInventoryLocation({ slotCode: '__SYSTEM_DEFAULT__' })).toBe('Kệ chưa xác định')
    expect(formatInventoryLocation({ slotCode: '' })).toBe('Vị trí chưa xác định')
  })
})

describe('stock movement reference labels', () => {
  it.each([
    ['GoodsReceiptItem', 'Phiếu nhận hàng'],
    ['StockTransfer', 'Phiếu điều chuyển'],
    ['StockIssuePickDetail', 'Phiếu xuất kho'],
    ['StockAdjustment', 'Phiếu điều chỉnh tồn'],
    ['OpeningStockRecord', 'Phiếu tồn đầu kỳ'],
    ['DamageCase', 'Phiếu hàng hỏng'],
    ['GoodsReturnRequestItem', 'Phiếu trả hàng'],
    ['UnknownInternalType', 'Chứng từ khác'],
    ['', 'Không có nguồn'],
  ])('translates %s', (value, label) => {
    expect(formatStockMovementReference(value)).toBe(label)
  })
})
