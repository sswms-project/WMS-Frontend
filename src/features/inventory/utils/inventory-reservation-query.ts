import type {
  InventoryReservationQuery,
  InventoryReservationStatus,
} from '../types/inventory.types'

export function buildInventoryReservationQuery(
  warehouseId: string,
  productId: string,
  status: InventoryReservationStatus,
  pageNumber = 1,
  pageSize = 20
): InventoryReservationQuery {
  return {
    pageNumber,
    pageSize,
    ...(warehouseId ? { warehouseId } : {}),
    ...(productId ? { productId } : {}),
    status,
  }
}
