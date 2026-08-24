import type { InventoryListQuery } from '../types/inventory.types'

interface InventoryFilters {
  readonly searchTerm: string
  readonly warehouseId: string
  readonly productId: string
}

export function buildInventoryQuery(
  filters: InventoryFilters,
  pageNumber: number,
  pageSize: number
): InventoryListQuery {
  const searchTerm = filters.searchTerm.trim()

  return {
    pageNumber,
    pageSize,
    ...(searchTerm ? { searchTerm } : {}),
    ...(filters.warehouseId ? { warehouseId: filters.warehouseId } : {}),
    ...(filters.productId ? { productId: filters.productId } : {}),
  }
}
