export const PURCHASE_ORDER_STATUSES = [
  'Draft',
  'PendingApproval',
  'Approved',
  'Rejected',
  'Sent',
  'Confirmed',
  'PartiallyReceived',
  'Received',
  'Cancelled',
] as const

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number]
export type PurchaseOrderAction = 'Update' | 'Submit' | 'Approve' | 'Reject'

export interface LookupQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: 'Active' | 'Inactive'
}

export interface PurchaseOrderListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: PurchaseOrderStatus
  supplierId?: string
  warehouseId?: string
  creatorId?: string
  dateFrom?: string
  dateTo?: string
}

export interface PurchaseOrderSummary {
  id: string
  poNumber: string
  warehouseId: string | null
  warehouseCode: string | null
  warehouseName: string | null
  supplierId: string
  supplierName: string
  status: PurchaseOrderStatus
  createdBy: string
  createdByName: string
  expectedDate: string | null
  createdAt: string
  lineCount: number
  orderedQuantity: number
  receivedQuantity: number
}

export interface LifecycleEvent {
  action: string
  fromState: string | null
  toState: string | null
  actorId: string
  actorName: string
  reason: string | null
  createdAt: string
}

export interface PurchaseOrderLine {
  id: string
  productId: string
  productSKU: string
  productName: string
  unitName: string | null
  quantity: number
  receivedQuantity: number
  remainingQuantity: number
  unitPrice: number | null
}

export interface PurchaseOrderDetail extends Omit<
  PurchaseOrderSummary,
  'lineCount' | 'orderedQuantity' | 'receivedQuantity'
> {
  approvedBy: string | null
  approvedByName: string | null
  modifiedAt: string | null
  submittedAt: string | null
  approvedAt: string | null
  rejectionReason: string | null
  lines: PurchaseOrderLine[]
  history: LifecycleEvent[]
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface AllowedActionsResponse {
  allowedActions: PurchaseOrderAction[]
}

export interface PurchaseOrderLineRequest {
  productId: string
  quantity: number
  unitPrice: number | null
}

export interface SavePurchaseOrderRequest {
  warehouseId: string
  supplierId: string
  expectedDate: string | null
  lines: PurchaseOrderLineRequest[]
}

export interface ProductOption {
  id: string
  sku: string
  productName: string
  unitId: string
  unitName: string
  status: string
}

export interface SupplierOption {
  id: string
  supplierName: string
  phone: string
  email: string | null
  status: string
}

export interface LookupListResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
