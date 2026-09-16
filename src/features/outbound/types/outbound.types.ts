export const OUTBOUND_ORDER_STATUSES = [
  'Pending',
  'Picking',
  'Packing',
  'ReadyToShip',
  'AssignedToTransport',
  'Shipping',
  'Delivered',
  'Failed',
] as const

export type OutboundOrderStatus = (typeof OUTBOUND_ORDER_STATUSES)[number]

export const RETURN_STATUSES = ['Requested', 'Approved', 'Rejected', 'Restocked'] as const

export type ReturnStatus = (typeof RETURN_STATUSES)[number]

export const RETURN_ITEM_CONDITIONS = ['Good', 'Damaged', 'Expired', 'Scrap'] as const

export type ReturnItemCondition = (typeof RETURN_ITEM_CONDITIONS)[number]

export interface OutboundOrderListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: OutboundOrderStatus
  warehouseId?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
}

export interface OutboundOrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  pickedQuantity: number
  returnedQuantity: number
  returnableQuantity: number
  pickDetails: OutboundPickDetail[]
}

export interface OutboundPickDetail {
  id: string
  inventoryStockId: string
  slotId: string
  slotCode: string
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

export interface OutboundOrderSummary {
  id: string
  orderCode: string
  customerId: string
  customerName: string
  customerCode: string
  warehouseId: string
  warehouseName: string
  purpose: string | null
  recipientName: string
  recipientPhone: string
  recipientEmail: string | null
  recipientAddress: string
  status: OutboundOrderStatus
  createdAt: string
  deliveredAt: string | null
  failedReason: string | null
  items: OutboundOrderItem[]
}

export interface OutboundOrderListResponse {
  items: OutboundOrderSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CreateOutboundOrderItemRequest {
  productId: string
  quantity: number
}

export interface CreateOutboundOrderRequest {
  customerId: string
  warehouseId: string
  items: CreateOutboundOrderItemRequest[]
  purpose?: string | null
}

export interface IssueStockItemRequest {
  outboundOrderItemId: string
  inventoryStockId: string
  pickedQuantity: number
}

export interface IssueStockRequest {
  items: IssueStockItemRequest[]
}

export interface RecordReturnItemRequest {
  outboundPickDetailId: string
  quantity: number
  condition: ReturnItemCondition
  restockSlotId: string | null
}

export interface RecordReturnRequest {
  reason: string
  items: RecordReturnItemRequest[]
}

export interface ReturnItem {
  id: string
  outboundPickDetailId: string | null
  productId: string
  productName: string
  sku: string
  quantity: number
  condition: ReturnItemCondition
  restockSlotId: string | null
  lotId: string | null
  lotNumber: string | null
}

export interface ReturnSummary {
  id: string
  returnCode: string
  outboundOrderId: string
  orderCode: string
  reason: string
  status: ReturnStatus
  createdAt: string
  createdBy: string
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  items: ReturnItem[]
}

export interface ReturnListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: ReturnStatus
  outboundOrderId?: string
  warehouseId?: string
  dateFrom?: string
  dateTo?: string
}

export interface ReturnListResponse {
  items: ReturnSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface RejectReturnRequest {
  reason: string
}

export interface OutboundOrderFilters {
  status: OutboundOrderStatus | ''
  warehouseId: string
}
