import type { GoodsReceiptItem, SavePutAwayPlanRequest } from '../types/inbound.types'

export interface PlanDraftLine {
  /** Khóa ổn định cho React; không gửi lên Backend. */
  readonly key: string
  readonly slotId: string
  readonly quantity: number
}

export type PlanDrafts = Readonly<Record<string, readonly PlanDraftLine[]>>

interface PlanSlot {
  readonly id: string
  readonly unavailableReason?: string
}

export interface PlanDraftValidation {
  /** Lỗi theo `${itemId}:${key}` của dòng. */
  readonly lineErrors: ReadonlyMap<string, string>
  /** Cảnh báo không chặn lưu, ví dụ vị trí đã đầy. */
  readonly lineWarnings: ReadonlyMap<string, string>
  readonly itemErrors: ReadonlyMap<string, string>
  readonly plannedByItem: ReadonlyMap<string, number>
  readonly canSave: boolean
}

const toCents = (value: number) => Math.round(value * 100)

export function getPlannableItems(items: readonly GoodsReceiptItem[]) {
  return items.filter((item) => item.inboundRequestItemId && item.remainingPutAwayQuantity > 0)
}

export function buildPlanDrafts(items: readonly GoodsReceiptItem[]): PlanDrafts {
  return Object.fromEntries(
    getPlannableItems(items).map((item) => [
      item.id,
      item.putAwayPlan.map((line) => ({
        key: line.id,
        slotId: line.slotId,
        quantity: line.quantity,
      })),
    ])
  )
}

export function validatePlanDrafts(
  items: readonly GoodsReceiptItem[],
  drafts: PlanDrafts,
  slots: readonly PlanSlot[]
): PlanDraftValidation {
  const slotById = new Map(slots.map((slot) => [slot.id, slot]))
  const lineErrors = new Map<string, string>()
  const lineWarnings = new Map<string, string>()
  const itemErrors = new Map<string, string>()
  const plannedByItem = new Map<string, number>()

  for (const item of getPlannableItems(items)) {
    const lines = drafts[item.id] ?? []
    const seen = new Set<string>()
    let planned = 0
    for (const line of lines) {
      const key = `${item.id}:${line.key}`
      const slot = slotById.get(line.slotId)
      if (!line.slotId || !slot) lineErrors.set(key, 'Vui lòng chọn vị trí lưu trữ.')
      else if (seen.has(line.slotId))
        lineErrors.set(key, 'Vị trí này đã được cấu hình cho sản phẩm. Hãy sửa dòng đã có.')
      else if (slot.unavailableReason) lineWarnings.set(key, slot.unavailableReason)
      seen.add(line.slotId)

      if (!Number.isFinite(line.quantity) || line.quantity <= 0)
        lineErrors.set(key, lineErrors.get(key) ?? 'Số lượng phải lớn hơn 0.')
      else if (toCents(line.quantity) / 100 !== line.quantity)
        lineErrors.set(key, lineErrors.get(key) ?? 'Số lượng chỉ có tối đa hai chữ số thập phân.')
      else planned += toCents(line.quantity)
    }
    plannedByItem.set(item.id, planned / 100)
    if (planned > toCents(item.remainingPutAwayQuantity))
      itemErrors.set(
        item.id,
        `Chỉ còn ${item.remainingPutAwayQuantity} ${item.baseUnitName} chưa cất; đang cấu hình ${planned / 100}.`
      )
  }

  return {
    lineErrors,
    lineWarnings,
    itemErrors,
    plannedByItem,
    canSave: lineErrors.size === 0 && itemErrors.size === 0,
  }
}

export function toSavePlanRequest(
  items: readonly GoodsReceiptItem[],
  drafts: PlanDrafts,
  expectedVersion: string
): SavePutAwayPlanRequest {
  return {
    expectedVersion,
    items: getPlannableItems(items).map((item) => ({
      goodsReceiptItemId: item.id,
      slots: (drafts[item.id] ?? []).map((line) => ({
        slotId: line.slotId,
        quantity: line.quantity,
      })),
    })),
  }
}

/** Phần còn phải cất của dòng hàng chưa được cấu hình vị trí nào (đơn vị gốc). */
export function getUnplannedQuantity(item: GoodsReceiptItem, lines: readonly PlanDraftLine[]) {
  const planned = lines.reduce(
    (sum, line) => sum + toCents(Number.isFinite(line.quantity) ? line.quantity : 0),
    0
  )
  return Math.max(0, toCents(item.remainingPutAwayQuantity) - planned) / 100
}
