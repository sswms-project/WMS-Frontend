import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { GoodsReceiptItem, PutAwayUnit } from '../types/inbound.types'

function scaledDecimal(value: number, precision: number): bigint | null {
  if (!Number.isFinite(value) || value < 0 || value >= 1e16) return null
  const fixed = value.toFixed(precision)
  if (Number(fixed) !== value) return null
  return BigInt(fixed.replace('.', ''))
}

// BE uses decimal; exact scaled arithmetic prevents the preview from silently rounding stock.
export function getPutawayBaseQuantity(
  enteredQuantity: number,
  unit: PutAwayUnit | undefined,
  baseUnit: PutAwayUnit | undefined
): number | null {
  if (
    !unit ||
    !baseUnit ||
    !Number.isInteger(unit.quantityPrecision) ||
    unit.quantityPrecision < 0 ||
    unit.quantityPrecision > 6 ||
    !Number.isInteger(baseUnit.quantityPrecision) ||
    baseUnit.quantityPrecision < 0 ||
    baseUnit.quantityPrecision > 6
  )
    return null
  const quantity = scaledDecimal(enteredQuantity, unit.quantityPrecision)
  const factor = scaledDecimal(unit.conversionFactor, 6)
  if (quantity === null || factor === null || factor <= BigInt(0)) return null
  const denominator = BigInt(10) ** BigInt(unit.quantityPrecision + 4)
  const numerator = quantity * factor
  if (numerator % denominator !== BigInt(0)) return null
  const cents = numerator / denominator
  if (
    cents > BigInt(Number.MAX_SAFE_INTEGER) ||
    cents % BigInt(10) ** BigInt(2 - Math.min(2, baseUnit.quantityPrecision)) !== BigInt(0)
  )
    return null
  const baseQuantity = Number(cents) / 100
  return scaledDecimal(baseQuantity, 2) === cents &&
    Math.round(baseQuantity * 100) === Number(cents)
    ? baseQuantity
    : null
}

export function getPutawayRemainingInput(
  item: GoodsReceiptItem,
  remaining: number,
  preferredUnitId = item.enteredUnitId
) {
  const baseUnit = item.allowedUnits?.find((unit) => unit.unitId === item.baseUnitId)
  const cents = scaledDecimal(remaining, 2)
  if (!baseUnit || cents === null || cents > BigInt(Number.MAX_SAFE_INTEGER)) return null
  const candidates = [preferredUnitId, item.enteredUnitId, item.baseUnitId]
  for (const unitId of candidates) {
    const unit = item.allowedUnits.find((candidate) => candidate.unitId === unitId)
    if (!unit) continue
    const factor = scaledDecimal(unit.conversionFactor, 6)
    if (factor === null || factor <= BigInt(0)) continue
    const numerator = cents * BigInt(10_000_000_000)
    if (numerator % factor !== BigInt(0)) continue
    const microQuantity = numerator / factor
    const enteredQuantity = Number(microQuantity) / 1_000_000
    if (scaledDecimal(enteredQuantity, 6) !== microQuantity) continue
    if (getPutawayBaseQuantity(enteredQuantity, unit, baseUnit) === remaining)
      return { enteredQuantity, enteredUnitId: unit.unitId }
  }
  return null
}

export function formatPutawayQuantity(item: GoodsReceiptItem, baseQuantity: number): string {
  const input = getPutawayRemainingInput(item, baseQuantity)
  const baseLabel = `${formatQuantity(baseQuantity)} ${item.baseUnitName || '(chưa có đơn vị)'}`
  if (!input || input.enteredUnitId === item.baseUnitId) return baseLabel
  const unit = item.allowedUnits.find((candidate) => candidate.unitId === input.enteredUnitId)!
  return `${formatQuantity(input.enteredQuantity)} ${unit.unitName} (${baseLabel})`
}
