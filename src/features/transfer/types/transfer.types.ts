export const TRANSFER_STATUSES = ['Draft', 'InTransit', 'Completed', 'Cancelled'] as const

export type TransferStatus = (typeof TRANSFER_STATUSES)[number]

export interface TransferListQuery {
  pageNumber: number
  pageSize: number
  status?: TransferStatus
  sourceWarehouseId?: string
  destinationWarehouseId?: string
}

export interface TransferItem {
  id: string
  productId: string
  productName: string
  sku: string
  sourceSlotId: string
  sourceSlotCode: string
  destinationSlotId: string
  destinationSlotCode: string
  quantity: number
}

export interface TransferSummary {
  id: string
  transferCode: string
  sourceWarehouseId: string
  sourceWarehouseName: string
  destinationWarehouseId: string
  destinationWarehouseName: string
  status: TransferStatus
  createdAt: string
  items: TransferItem[]
}

export interface TransferListResponse {
  items: TransferSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CreateTransferItemRequest {
  productId: string
  sourceSlotId: string
  destinationSlotId: string
  quantity: number
}

export interface CreateTransferRequest {
  sourceWarehouseId: string
  destinationWarehouseId: string
  items: CreateTransferItemRequest[]
}

export interface RejectTransferRequest {
  reason: string
}

export interface TransferFilters {
  status: TransferStatus | ''
  sourceWarehouseId: string
  destinationWarehouseId: string
}
