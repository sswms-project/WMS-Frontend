export const INBOUND_REQUEST_STATUS = {
  Draft: 'Draft',
  PendingApproval: 'PendingApproval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Sent: 'Sent',
  Confirmed: 'Confirmed',
  PartiallyReceived: 'PartiallyReceived',
  Received: 'Received',
  Cancelled: 'Cancelled',
} as const

export const INBOUND_REQUEST_STATUSES = Object.values(INBOUND_REQUEST_STATUS)

export type InboundRequestStatus = (typeof INBOUND_REQUEST_STATUSES)[number]
export const INBOUND_REQUEST_ACTION = {
  Update: 'Update',
  Submit: 'Submit',
  Approve: 'Approve',
  Reject: 'Reject',
} as const
export type InboundRequestAction =
  (typeof INBOUND_REQUEST_ACTION)[keyof typeof INBOUND_REQUEST_ACTION]
export const INBOUND_SOURCE_TYPE = {
  Supplier: 'Supplier',
  InternalBranch: 'InternalBranch',
  InternalDepartment: 'InternalDepartment',
  ExternalPartner: 'ExternalPartner',
  Other: 'Other',
} as const
export type InboundSourceType = (typeof INBOUND_SOURCE_TYPE)[keyof typeof INBOUND_SOURCE_TYPE]
export const RECORD_STATUS = { Active: 'Active', Inactive: 'Inactive' } as const

export interface LookupQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: (typeof RECORD_STATUS)[keyof typeof RECORD_STATUS]
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
  supplierId: string | null
  supplierName: string | null
  sourceType: InboundSourceType
  sourceName: string | null
  sourceReference: string | null
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
  enteredUnitId: string
  enteredUnitName: string | null
  unitQuantityPrecision: number
  enteredUnitQuantityPrecision: number
  enteredQuantity: number
  conversionFactorSnapshot: number
  quantity: number
  receivedQuantity: number
  remainingQuantity: number
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

export interface InboundRequestStatusCount {
  status: InboundRequestStatus
  count: number
}

export interface InboundRequestListResponse extends PagedResponse<InboundRequestSummary> {
  statusCounts: InboundRequestStatusCount[]
}

export interface AllowedActionsResponse {
  allowedActions: InboundRequestAction[]
}

export interface InboundRequestLineRequest {
  productId: string
  quantity: number
  unitId: string | null
}

export interface SaveInboundRequestRequest {
  warehouseId: string
  supplierId: string | null
  sourceType: InboundSourceType
  sourceName: string | null
  sourceReference: string | null
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
