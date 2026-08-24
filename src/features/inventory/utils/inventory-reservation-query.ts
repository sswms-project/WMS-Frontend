import type { InventoryReservationQuery } from '../types/inventory.types'

export function buildInventoryReservationQuery(
  warehouseId: string,
  productId: string
): InventoryReservationQuery {
  return {
    ...(warehouseId ? { warehouseId } : {}),
    ...(productId ? { productId } : {}),
  }
}
