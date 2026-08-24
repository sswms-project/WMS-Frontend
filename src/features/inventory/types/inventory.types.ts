export interface InventoryListQuery {
  pageNumber: number
  pageSize: number
  warehouseId?: string
  productId?: string
  searchTerm?: string
}

export interface InventoryBalance {
  id: string
  productId: string
  sku: string
  productName: string
  warehouseId: string
  warehouseName: string
  slotId: string
  slotCode: string
  quantityOnHand: number
  reservedQuantity: number
  availableQuantity: number
  updatedAt: string
}

export interface InventoryBalanceListResponse {
  items: InventoryBalance[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface InventoryFilterOption {
  value: string
  label: string
}
