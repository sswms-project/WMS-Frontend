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
  const unit = getReceiptUnit(line, line.enteredUnitId)
  const quantity = line.remainingQuantity / unit.factor
  const scale = 10 ** unit.precision
  return Number.isFinite(quantity) &&
    Math.abs(quantity * scale - Math.round(quantity * scale)) < 1e-7
    ? (line.enteredUnitId ?? line.baseUnitId)
    : line.baseUnitId
}
