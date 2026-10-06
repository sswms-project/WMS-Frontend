import type { ReceivingTaskLine } from '../types/inbound.types'

export function getReceiptUnit(line: ReceivingTaskLine, unitId?: string) {
  const isRequestUnit = Boolean(
    unitId && unitId === line.enteredUnitId && unitId !== line.baseUnitId
  )
  return {
    factor: isRequestUnit ? (line.conversionFactorSnapshot ?? 1) : 1,
    name: isRequestUnit ? (line.enteredUnitName ?? '—') : (line.baseUnitName ?? '—'),
    precision: isRequestUnit
      ? (line.enteredUnitQuantityPrecision ?? 2)
      : (line.baseUnitQuantityPrecision ?? 2),
  }
}

export function getDefaultReceiptUnit(line: ReceivingTaskLine) {
  return getRemainingReceiptQuantity(line, line.enteredUnitId).unitId
}

export function getRemainingReceiptQuantity(line: ReceivingTaskLine, unitId?: string) {
  const unit = getReceiptUnit(line, unitId)
  const quantity = line.remainingQuantity / unit.factor
  const scale = 10 ** unit.precision
  const scaled = quantity * scale
  // Remove binary floating-point noise, not genuine partial packaging quantities.
  const isRepresentable =
    Number.isFinite(quantity) &&
    Math.abs(scaled - Math.round(scaled)) <= Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4
  return isRepresentable
    ? { unitId: unitId ?? line.baseUnitId, quantity: Number(quantity.toFixed(unit.precision)) }
    : { unitId: line.baseUnitId, quantity: line.remainingQuantity }
}
