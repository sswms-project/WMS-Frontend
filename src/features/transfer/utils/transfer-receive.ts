import {
  receiptEntryKey,
  type TransferReceiptEntryValues,
  type TransferReceiptFormValues,
} from '../schemas/transfer-fulfillment.schema'
import type { ReceiveTransferShipmentRequest, TransferReceiveSheet } from '../types/transfer.types'

/** Mỗi dòng/lô bắt đầu bằng một hàng nhận tốt toàn bộ; nhân viên sửa khi thực tế lệch. */
export function buildInitialReceiptEntries(
  sheet: TransferReceiveSheet
): TransferReceiptEntryValues[] {
  return sheet.lines.flatMap((line) =>
    line.lots.map((lot) => ({
      lineId: line.lineId,
      lotId: lot.lotId,
      productLabel: `${line.sku} · ${line.productName}`,
      destinationSlotId: '',
      scannedSlotCode: '',
      scannedProductCode: '',
      goodQuantity: Math.max(0, lot.dispatchedQuantity - lot.receivedQuantity),
      damagedQuantity: 0,
      missingQuantity: 0,
      reasonCode: '',
      note: '',
    }))
  )
}

export function buildExpectedReceiptQuantities(sheet: TransferReceiveSheet): Map<string, number> {
  const expected = new Map<string, number>()
  for (const line of sheet.lines) {
    for (const lot of line.lots) {
      expected.set(
        receiptEntryKey(line.lineId, lot.lotId),
        Math.max(0, lot.dispatchedQuantity - lot.receivedQuantity)
      )
    }
  }
  return expected
}

/** Vị trí nhận hàng đã tra ra từ mã quét: chỉ cần ID để gửi và mã để hiển thị. */
export interface ReceivableSlot {
  readonly id: string
  readonly code: string
}

export function toReceiveRequest(
  values: TransferReceiptFormValues,
  expectedVersion: string
): ReceiveTransferShipmentRequest {
  return {
    expectedVersion,
    entries: values.entries.map((entry) => ({
      lineId: entry.lineId,
      lotId: entry.lotId,
      destinationSlotId: entry.destinationSlotId || null,
      goodQuantity: entry.goodQuantity,
      damagedQuantity: entry.damagedQuantity,
      missingQuantity: entry.missingQuantity,
      reasonCode: entry.reasonCode || null,
      note: entry.note || null,
      scannedSlotCode: entry.scannedSlotCode || null,
      scannedProductCode: entry.scannedProductCode || null,
    })),
  }
}

interface RemovableReceiptEntry {
  readonly lineId: string
  readonly lotId: string | null
  readonly goodQuantity: number
  readonly damagedQuantity: number
  readonly missingQuantity: number
}

/**
 * Bỏ một khai báo nhận: số lượng của nó được cộng sang khai báo còn lại của cùng dòng và lô, để tổng vẫn khớp
 * số đã xuất và không để lại khai báo trống (không còn ô quét) sau khi bỏ.
 */
export function removeReceiptEntry<T extends RemovableReceiptEntry>(
  entries: readonly T[],
  index: number
): T[] {
  const removed = entries[index]
  if (!removed) return [...entries]
  const next = entries.filter((_, position) => position !== index)
  const target = next.findIndex(
    (entry) => entry.lineId === removed.lineId && entry.lotId === removed.lotId
  )
  const absorber = next[target]
  if (!absorber) return next
  next[target] = {
    ...absorber,
    goodQuantity: absorber.goodQuantity + removed.goodQuantity,
    damagedQuantity: absorber.damagedQuantity + removed.damagedQuantity,
    missingQuantity: absorber.missingQuantity + removed.missingQuantity,
  }
  return next
}
