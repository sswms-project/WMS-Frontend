import type { WarehouseListQuery } from '../types/warehouse.types'

export function buildWarehouseQuery(
  searchText: string,
  page: number,
  pageSize: number
): WarehouseListQuery {
  const normalizedSearchText = searchText.trim()

  return {
    top: pageSize,
    skip: (page - 1) * pageSize,
    needTotalCount: true,
    ...(normalizedSearchText ? { searchText: normalizedSearchText } : {}),
  }
}
