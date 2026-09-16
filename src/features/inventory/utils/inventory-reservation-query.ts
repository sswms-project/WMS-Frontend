import type {
  InventoryReservationQuery,
  InventoryReservationStatus,
} from '../types/inventory.types'

export function buildInventoryReservationQuery(
  warehouseId: string,
  productId: string,
  status: InventoryReservationStatus
): InventoryReservationQuery {
  return {
    ...(warehouseId ? { warehouseId } : {}),
    ...(productId ? { productId } : {}),
    status,
  }
}
