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

export const STOCK_MOVEMENT_TYPES = {
  inbound: 'Inbound',
  outbound: 'Outbound',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
  return: 'Return',
} as const

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[keyof typeof STOCK_MOVEMENT_TYPES]

export interface StockMovementListQuery {
  pageNumber: number
  pageSize: number
  productId?: string
  movementType?: StockMovementType
  dateFrom?: string
  dateTo?: string
}

export interface StockMovement {
  id: string
  productId: string
  sku: string
  productName: string
  slotId: string
  slotCode: string
  quantity: number
  movementType: string
  referenceType: string
  referenceId: string
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface StockMovementListResponse {
  items: StockMovement[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
