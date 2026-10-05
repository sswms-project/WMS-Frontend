import type { GoodsReceiptItem } from '../types/inbound.types'
import type { PutawayFormValues } from '../schemas/inbound.schema'
import { getPutawayRemainingInput } from './putaway-units'

export const PUTAWAY_REASON_MIN_LENGTH = 5
export const PUTAWAY_REASON_MAX_LENGTH = 500
export const PUTAWAY_EVIDENCE_MAX_COUNT = 3
export const PUTAWAY_EVIDENCE_MAX_BYTES = 5 * 1024 * 1024
export const PUTAWAY_EVIDENCE_ACCEPT = 'image/jpeg,image/png'

type AllocationLine = PutawayFormValues['lines'][number]

const toCents = (value: number) => Math.round(value * 100)

export function hasPutawayPlan(item: GoodsReceiptItem) {
  return item.putAwayPlan.length > 0
}

export function getPlannedQuantity(item: GoodsReceiptItem, slotId: string) {
  return (
    item.putAwayPlan
      .filter((line) => line.slotId === slotId)
      .reduce((sum, line) => sum + toCents(line.quantity), 0) / 100
  )
}

function remainderInput(item: GoodsReceiptItem, quantity: number) {
  return (
    getPutawayRemainingInput(item, quantity) ?? {
      enteredQuantity: quantity,
      enteredUnitId: item.baseUnitId,
    }
  )
}

/**
 * Điền sẵn phân bổ theo kế hoạch của quản lý: mỗi vị trí đã cấu hình một dòng, phần chưa được
 * cấu hình (nếu có) là một dòng chưa chọn vị trí để nhân viên tự quyết.
 */
export function buildPlannedAllocations(item: GoodsReceiptItem): AllocationLine[] {
  const remaining = toCents(item.remainingPutAwayQuantity)
  if (!hasPutawayPlan(item)) {
    return [
      {
        goodsReceiptItemId: item.id,
        slotId: '',
        ...remainderInput(item, item.remainingPutAwayQuantity),
      },
    ]
  }

  let planned = 0
  const lines: AllocationLine[] = []
  for (const planLine of item.putAwayPlan) {
    const cents = Math.min(toCents(planLine.quantity), remaining - planned)
    if (cents <= 0) continue
    planned += cents
    lines.push({
      goodsReceiptItemId: item.id,
      slotId: planLine.slotId,
      ...remainderInput(item, cents / 100),
    })
  }
  if (remaining - planned > 0) {
    lines.push({
      goodsReceiptItemId: item.id,
      slotId: '',
      ...remainderInput(item, (remaining - planned) / 100),
    })
  }
  return lines
}

export interface PutawayPlanDeviation {
  /** Chỉ số các dòng phân bổ đang khác kế hoạch. */
  readonly offPlanRows: ReadonlySet<number>
  readonly requiresReason: boolean
}

/**
 * Giống quy tắc của Backend: dòng hàng đã có kế hoạch mà số lượng cất vào một vị trí vượt phần được
 * cấu hình cho vị trí đó thì là khác kế hoạch; dòng hàng chưa có kế hoạch thì không bao giờ khác.
 */
export function getPutawayPlanDeviation(
  lines: readonly AllocationLine[],
  baseQuantities: readonly (number | null)[],
  items: readonly GoodsReceiptItem[]
): PutawayPlanDeviation {
  const groups = new Map<
    string,
    { item: GoodsReceiptItem; slotId: string; cents: number; rows: number[] }
  >()
  lines.forEach((line, index) => {
    const item = items.find((candidate) => candidate.id === line.goodsReceiptItemId)
    const baseQuantity = baseQuantities[index]
    if (!item || !hasPutawayPlan(item) || !line.slotId || baseQuantity == null) return
    const key = `${item.id}:${line.slotId}`
    const group = groups.get(key) ?? { item, slotId: line.slotId, cents: 0, rows: [] }
    group.cents += toCents(baseQuantity)
    group.rows.push(index)
    groups.set(key, group)
  })

  const offPlanRows = new Set<number>()
  for (const group of groups.values()) {
    if (group.cents > toCents(getPlannedQuantity(group.item, group.slotId)))
      group.rows.forEach((row) => offPlanRows.add(row))
  }
  return { offPlanRows, requiresReason: offPlanRows.size > 0 }
}

export function isPutawayReasonValid(reason: string | null | undefined) {
  const length = (reason ?? '').trim().length
  return length >= PUTAWAY_REASON_MIN_LENGTH && length <= PUTAWAY_REASON_MAX_LENGTH
}

export function getPutawayEvidenceError(file: File, currentCount: number) {
  if (currentCount >= PUTAWAY_EVIDENCE_MAX_COUNT)
    return `Chỉ được đính kèm tối đa ${PUTAWAY_EVIDENCE_MAX_COUNT} ảnh.`
  if (!['image/jpeg', 'image/png'].includes(file.type)) return 'Chỉ chấp nhận ảnh JPG hoặc PNG.'
  if (file.size > PUTAWAY_EVIDENCE_MAX_BYTES) return 'Mỗi ảnh tối đa 5 MB.'
  return null
}
