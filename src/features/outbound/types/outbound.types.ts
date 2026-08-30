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

export const RETURN_ITEM_CONDITIONS = ['Good', 'Damaged'] as const

export type ReturnItemCondition = (typeof RETURN_ITEM_CONDITIONS)[number]

export interface OutboundOrderListQuery {
  pageNumber: number
  pageSize: number
  status?: OutboundOrderStatus
  warehouseId?: string
  customerId?: string
}

export interface OutboundOrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  pickedQuantity: number
  sourceSlotId: string | null
  sourceSlotCode: string | null
}

export interface OutboundOrderSummary {
  id: string
  orderCode: string
  customerId: string
  customerName: string
  warehouseId: string
  warehouseName: string
  status: OutboundOrderStatus
  createdAt: string
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
}

export interface IssueStockItemRequest {
  outboundOrderItemId: string
  sourceSlotId: string
  pickedQuantity: number
}

export interface IssueStockRequest {
  items: IssueStockItemRequest[]
}

export interface RecordReturnItemRequest {
  productId: string
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
  productId: string
  productName: string
  sku: string
  quantity: number
  condition: ReturnItemCondition
  restockSlotId: string | null
}

export interface ReturnSummary {
  id: string
  returnCode: string
  outboundOrderId: string
  orderCode: string
  reason: string
  status: ReturnStatus
  createdAt: string
  items: ReturnItem[]
}

export interface ReturnListQuery {
  pageNumber: number
  pageSize: number
  status?: ReturnStatus
}

export interface ReturnListResponse {
  items: ReturnSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CustomerListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
}

export interface CustomerOption {
  id: string
  customerName: string
  phone: string
  email: string | null
  address: string
}

export interface CustomerListResponse {
  items: CustomerOption[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface OutboundOrderFilters {
  status: OutboundOrderStatus | ''
  warehouseId: string
}
