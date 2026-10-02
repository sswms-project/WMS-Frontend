import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { GoodsReceiptItem } from '../types/inbound.types'
import { putawayLineSchema, type PutawayFormValues } from './inbound.schema'

type AllocationField = keyof PutawayFormValues['lines'][number]
interface AllocationSlot {
  id: string
  code: string
  allowsMixedProducts?: boolean
  unavailableReason?: string
}

// Reserve only complete, valid rows in display order. Hundredths avoid 0.1 + 0.2 rounding drift.
export function getPutawayAllocationState(
  lines: PutawayFormValues['lines'],
  items: readonly GoodsReceiptItem[],
  slots: readonly AllocationSlot[]
) {
  const itemById = new Map(items.map((item) => [item.id, item]))
  const slotById = new Map(slots.map((slot) => [slot.id, slot]))
  const assignedByItem = new Map<string, number>()
  const productBySlot = new Map<string, string>()
  const requestedByItem = new Map<string, number>()
  const allocations = new Set<string>()
  let totalAssigned = 0

  const rows = lines.map((line) => {
    const item = itemById.get(line.goodsReceiptItemId)
    const slot = slotById.get(line.slotId)
    const quantity = Math.round(line.quantity * 100)
    const itemAvailable =
      Math.max(
        0,
        Math.round((item?.remainingPutAwayQuantity ?? 0) * 100) -
          (assignedByItem.get(line.goodsReceiptItemId) ?? 0)
      ) / 100
    const allocationKey = `${line.goodsReceiptItemId}:${line.slotId}`
    if (item && Number.isFinite(quantity) && quantity > 0)
      requestedByItem.set(item.id, (requestedByItem.get(item.id) ?? 0) + quantity)

    const result = putawayLineSchema
      .superRefine((value, context) => {
        const error = (field: AllocationField, message: string) =>
          context.addIssue({ code: 'custom', path: [field], message })
        if (!item || !item.inboundRequestItemId)
          error('goodsReceiptItemId', 'Sản phẩm không thuộc dòng yêu cầu nhập kho của phiếu này.')
        else if (value.quantity > itemAvailable)
          error(
            'quantity',
            `${item.productName}: dòng này tối đa ${formatQuantity(itemAvailable)}; vượt ${formatQuantity((quantity - Math.round(itemAvailable * 100)) / 100)}. Giới hạn riêng của dòng hàng là ${formatQuantity(item.remainingPutAwayQuantity)}.`
          )
        if (!slot) error('slotId', 'Vui lòng chọn vị trí lưu trữ còn khả dụng.')
        else {
          if (slot.unavailableReason) error('slotId', slot.unavailableReason)
          if (
            slot.allowsMixedProducts === false &&
            item &&
            productBySlot.has(slot.id) &&
            productBySlot.get(slot.id) !== item.productId
          )
            error('slotId', 'Vị trí này chỉ chứa một sản phẩm; đã được phân bổ cho sản phẩm khác.')
        }
        if (allocations.has(allocationKey))
          error('slotId', 'Sản phẩm đã được phân bổ vào vị trí này. Hãy sửa dòng đã có.')
      })
      .safeParse(line)
    const errors: Partial<Record<AllocationField, string>> = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as AllocationField
        errors[field] ??= issue.message
      }
    } else {
      assignedByItem.set(
        line.goodsReceiptItemId,
        (assignedByItem.get(line.goodsReceiptItemId) ?? 0) + quantity
      )
      productBySlot.set(line.slotId, item!.productId)
      allocations.add(allocationKey)
      totalAssigned += quantity
    }
    return {
      errors,
      itemAvailable,
      // Capacity is in its own UOM; only BE can validate the projected converted occupancy.
      maxQuantity: itemAvailable,
    }
  })

  return {
    rows,
    assignedByItem,
    requestedByItem,
    totalAssigned: totalAssigned / 100,
    canSubmit: rows.length > 0 && rows.every((row) => Object.keys(row.errors).length === 0),
  }
}
