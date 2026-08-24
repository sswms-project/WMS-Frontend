import type { StockMovementListQuery, StockMovementType } from '../types/inventory.types'

interface StockMovementFilters {
  readonly productId: string
  readonly movementType: StockMovementType | ''
  readonly dateFrom: string
  readonly dateTo: string
}

function toDateBoundary(value: string, boundary: 'start' | 'end'): string | undefined {
  if (!value) return undefined
  const time = boundary === 'start' ? '00:00:00.000' : '23:59:59.999'
  const date = new Date(`${value}T${time}`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function isStockMovementDateRangeValid(dateFrom: string, dateTo: string): boolean {
  return !dateFrom || !dateTo || dateFrom <= dateTo
}

export function buildStockMovementQuery(
  filters: StockMovementFilters,
  pageNumber: number,
  pageSize: number
): StockMovementListQuery {
  const dateFrom = toDateBoundary(filters.dateFrom, 'start')
  const dateTo = toDateBoundary(filters.dateTo, 'end')

  return {
    pageNumber,
    pageSize,
    ...(filters.productId ? { productId: filters.productId } : {}),
    ...(filters.movementType ? { movementType: filters.movementType } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  }
}
