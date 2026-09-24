export const INBOUND_REQUEST_STATUSES = [
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

export type InboundRequestStatus = (typeof INBOUND_REQUEST_STATUSES)[number]
export type InboundRequestAction = 'Update' | 'Submit' | 'Approve' | 'Reject'

export interface LookupQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: 'Active' | 'Inactive'
}

export interface InboundRequestListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: InboundRequestStatus
  supplierId?: string
  warehouseId?: string
  creatorId?: string
  dateFrom?: string
  dateTo?: string
}

export interface InboundRequestSummary {
  id: string
  inboundRequestCode: string
  warehouseId: string | null
  warehouseCode: string | null
  warehouseName: string | null
  supplierId: string
  supplierName: string
  currency: string
  status: InboundRequestStatus
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

export interface InboundRequestLine {
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

export interface InboundRequestDetail extends Omit<
  InboundRequestSummary,
  'lineCount' | 'orderedQuantity' | 'receivedQuantity'
> {
  approvedBy: string | null
  approvedByName: string | null
  modifiedAt: string | null
  submittedAt: string | null
  approvedAt: string | null
  rejectionReason: string | null
  lines: InboundRequestLine[]
  history: LifecycleEvent[]
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface AllowedActionsResponse {
  allowedActions: InboundRequestAction[]
}

export interface InboundRequestLineRequest {
  productId: string
  quantity: number
  unitPrice: number | null
}

export interface SaveInboundRequestRequest {
  warehouseId: string
  supplierId: string
  expectedDate: string | null
  lines: InboundRequestLineRequest[]
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

export interface LookupOption {
  value: string
  label: string
}

export interface ProductSearchState {
  readonly scope: string
  readonly value: string
}
