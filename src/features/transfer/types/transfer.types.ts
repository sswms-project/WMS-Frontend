export const TRANSFER_STATUSES = [
  'PendingSourceApproval',
  'Approved',
  'InTransit',
  'Completed',
  'ReceivedWithVariance',
  'Rejected',
  'Cancelled',
] as const

export type TransferStatus = (typeof TRANSFER_STATUSES)[number]

export interface TransferListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: TransferStatus
  sourceWarehouseId?: string
  destinationWarehouseId?: string
  dateFrom?: string
  dateTo?: string
}

export interface TransferSourceWarehouseQuery {
  destinationWarehouseId: string
  top: number
  skip: number
  needTotalCount: true
  searchText?: string
}

export interface TransferSourceInventoryQuery {
  destinationWarehouseId: string
  sourceWarehouseId: string
  pageNumber: number
  pageSize: number
  searchTerm?: string
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
  approvedQuantity: number
  dispatchedQuantity: number
  receivedQuantity: number
  damagedQuantity: number
  missingQuantity: number
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
  createdBy: string
  approvedBy: string | null
  approvedAt: string | null
  approvalNote: string | null
  rejectionReason: string | null
  dispatchedBy: string | null
  dispatchedAt: string | null
  receivedBy: string | null
  receivedAt: string | null
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

export interface ApproveTransferItemRequest {
  stockTransferItemId: string
  approvedQuantity: number
}

export interface ApproveTransferRequest {
  note?: string | null
  items?: ApproveTransferItemRequest[] | null
}

export interface ReceiveTransferItemRequest {
  stockTransferItemId: string
  receivedQuantity: number
  damagedQuantity: number
  missingQuantity: number
}

export interface ReceiveTransferRequest {
  items?: ReceiveTransferItemRequest[] | null
}

export interface TransferFilters {
  searchTerm: string
  status: TransferStatus | ''
  sourceWarehouseId: string
  destinationWarehouseId: string
  dateFrom: string
  dateTo: string
}
