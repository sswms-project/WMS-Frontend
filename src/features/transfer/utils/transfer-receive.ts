import type { LocationSearchResponse } from '@/features/warehouse/types/warehouse.types'
import type { ZoneResponse } from '@/types/warehouse'
import {
  receiptEntryKey,
  type TransferReceiptEntryValues,
  type TransferReceiptFormValues,
} from '../schemas/transfer-fulfillment.schema'
import type { ReceiveTransferShipmentRequest, TransferReceiveSheet } from '../types/transfer.types'
import { codesMatch } from './transfer-scan'

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

/** Vị trí cất hàng hợp lệ: hoạt động và không phải vị trí chờ xuất. */
export function findReceivableSlot(
  scannedCode: string,
  slots: readonly LocationSearchResponse[]
): ReceivableSlot | null {
  if (!scannedCode.trim()) return null
  const slot = slots.find(
    (candidate) =>
      candidate.type === 'Slot' &&
      !candidate.isOutboundStaging &&
      candidate.lifecycleStatus === 'Active' &&
      codesMatch(
        scannedCode,
        candidate.code,
        candidate.barcodeValue,
        `KOVIA:LOC:SLOT:${candidate.id}`
      )
  )
  return slot ? { id: slot.id, code: slot.code } : null
}

/**
 * Kệ quản lý ở mức kệ (RackLevel) không có ô con: hàng được cất vào ô mặc định của kệ nên quét mã kệ là đủ,
 * giống màn cất hàng của Nhập kho.
 */
export function findRackLevelSlot(
  scannedCode: string,
  zones: readonly ZoneResponse[]
): ReceivableSlot | null {
  if (!scannedCode.trim()) return null
  for (const zone of zones) {
    if (zone.status !== 'Active') continue
    for (const rack of zone.racks) {
      if (
        rack.status === 'Active' &&
        rack.storageMode === 'RackLevel' &&
        rack.defaultSlotId &&
        codesMatch(scannedCode, rack.rackCode, `KOVIA:LOC:RACK:${rack.id}`)
      ) {
        return { id: rack.defaultSlotId, code: rack.rackCode }
      }
    }
  }
  return null
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
