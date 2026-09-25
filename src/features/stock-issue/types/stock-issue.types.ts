export const STOCK_ISSUE_REQUEST_STATUSES = [
  'Pending',
  'Picking',
  'Picked',
  'AuthorizedForDispatch',
  'Dispatched',
  'Cancelled',
] as const

export type StockIssueRequestStatus = (typeof STOCK_ISSUE_REQUEST_STATUSES)[number]

export const GOODS_RETURN_REQUEST_STATUSES = [
  'Requested',
  'Approved',
  'Rejected',
  'Restocked',
] as const

export type GoodsReturnRequestStatus = (typeof GOODS_RETURN_REQUEST_STATUSES)[number]

export const GOODS_RETURN_REQUEST_ITEM_CONDITIONS = ['Good', 'Damaged', 'Expired', 'Scrap'] as const

export type GoodsReturnRequestItemCondition = (typeof GOODS_RETURN_REQUEST_ITEM_CONDITIONS)[number]

export interface StockIssueRequestListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: StockIssueRequestStatus
  warehouseId?: string
  stockRecipientId?: string
  dateFrom?: string
  dateTo?: string
}

export interface StockIssueRequestItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  pickedQuantity: number
  returnedQuantity: number
  returnableQuantity: number
  pickDetails: StockIssuePickDetail[]
}

export interface StockIssuePickDetail {
  id: string
  inventoryStockId: string
  slotId: string
  slotCode: string
  stagingSlotId: string
  stagingSlotCode: string
  lotId: string | null
  lotNumber: string | null
  qualityStatus: string
  pickedQuantity: number
  returnedQuantity: number
  returnableQuantity: number
  pickedByUserId: string
  pickedByName: string
  pickedAt: string
  issuedAt: string | null
}

export interface StockIssueRequestSummary {
  id: string
  stockIssueRequestCode: string
  stockRecipientId: string
  stockRecipientName: string
  recipientCode: string
  warehouseId: string
  warehouseName: string
  purpose: string | null
  recipientName: string
  recipientPhone: string
  recipientEmail: string | null
  recipientAddress: string
  status: StockIssueRequestStatus
  createdAt: string
  dispatchAuthorizedByUserId: string | null
  dispatchAuthorizedAt: string | null
  dispatchedAt: string | null
  items: StockIssueRequestItem[]
}

export interface StockIssueRequestListResponse {
  items: StockIssueRequestSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CreateStockIssueRequestItemRequest {
  productId: string
  quantity: number
}

export interface CreateStockIssueRequestRequest {
  stockRecipientId: string
  warehouseId: string
  items: CreateStockIssueRequestItemRequest[]
  purpose?: string | null
}

export interface RecordStockPickingItemRequest {
  stockIssueRequestItemId: string
  inventoryStockId: string
  pickedQuantity: number
}

export interface RecordStockPickingRequest {
  items: RecordStockPickingItemRequest[]
}

export interface CreateGoodsReturnRequestItemRequest {
  stockIssuePickDetailId: string
  quantity: number
  condition: GoodsReturnRequestItemCondition
  restockSlotId: string | null
}

export interface CreateGoodsReturnRequestRequest {
  reason: string
  items: CreateGoodsReturnRequestItemRequest[]
}

export interface GoodsReturnRequestItem {
  id: string
  stockIssuePickDetailId: string | null
  productId: string
  productName: string
  sku: string
  quantity: number
  condition: GoodsReturnRequestItemCondition
  restockSlotId: string | null
  lotId: string | null
  lotNumber: string | null
}

export interface GoodsReturnRequestSummary {
  id: string
  goodsReturnRequestCode: string
  stockIssueRequestId: string
  stockIssueRequestCode: string
  reason: string
  status: GoodsReturnRequestStatus
  createdAt: string
  createdBy: string
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  items: GoodsReturnRequestItem[]
}

export interface GoodsReturnRequestListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: GoodsReturnRequestStatus
  stockIssueRequestId?: string
  warehouseId?: string
  dateFrom?: string
  dateTo?: string
}

export interface GoodsReturnRequestListResponse {
  items: GoodsReturnRequestSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface RejectGoodsReturnRequestRequest {
  reason: string
}

export interface StockIssueRequestFilters {
  status: StockIssueRequestStatus | ''
  warehouseId: string
}
