import type {
  LifecycleEvent,
  PagedResponse,
} from '@/features/purchase-order/types/purchase-order.types'

export const INBOUND_RECEIPT_STATUSES = [
  'Draft',
  'PendingApproval',
  'Approved',
  'Completed',
  'Rejected',
] as const

export type InboundReceiptStatus = (typeof INBOUND_RECEIPT_STATUSES)[number]
export type InboundReceiptAction = 'Update' | 'Submit' | 'Approve' | 'Reject' | 'PutAway'

export interface InboundListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: InboundReceiptStatus
  warehouseId?: string
  creatorId?: string
  dateFrom?: string
  dateTo?: string
}

export interface ReceivingTaskQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  warehouseId?: string
  supplierId?: string
  expectedFrom?: string
  expectedTo?: string
}

export interface PutawayTaskQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  warehouseId?: string
}

export interface ReceivingTaskLine {
  purchaseOrderItemId: string
  productId: string
  productSKU: string
  productName: string
  barcodeValue: string | null
  orderedQuantity: number
  receivedQuantity: number
  remainingQuantity: number
}

export interface ReceivingTask {
  purchaseOrderId: string
  poNumber: string
  warehouseId: string
  warehouseName: string
  supplierId: string
  supplierName: string
  expectedDate: string | null
  orderedQuantity: number
  receivedQuantity: number
  remainingQuantity: number
  lines: ReceivingTaskLine[]
}

export interface InboundReceiptSummary {
  id: string
  receiptCode: string
  purchaseOrderId: string
  poNumber: string
  warehouseId: string
  warehouseName: string
  status: InboundReceiptStatus
  createdBy: string
  createdByName: string
  createdAt: string
  lineCount: number
  receivedQuantity: number
  damagedQuantity: number
  putAwayQuantity: number
}

export interface InboundReceiptItem {
  id: string
  purchaseOrderItemId: string | null
  productId: string
  productSKU: string
  productName: string
  orderedQuantity: number
  receivedQuantity: number
  damagedQuantity: number
  usableQuantity: number
  putAwayQuantity: number
  remainingPutAwayQuantity: number
  exceptionReason: string | null
}

export interface InboundReceiptDetail extends Omit<
  InboundReceiptSummary,
  'lineCount' | 'receivedQuantity' | 'damagedQuantity' | 'putAwayQuantity'
> {
  warehouseCode: string
  approvedBy: string | null
  approvedByName: string | null
  modifiedAt: string | null
  submittedAt: string | null
  approvedAt: string | null
  rejectionReason: string | null
  items: InboundReceiptItem[]
  history: LifecycleEvent[]
}

export interface ReceiptLineRequest {
  poLineId: string
  receivedQty: number
  damagedQty: number
  exceptionReason: string | null
}

export interface SaveInboundReceiptRequest {
  purchaseOrderId: string
  lines: ReceiptLineRequest[]
}

export interface PutawayLineRequest {
  inboundReceiptItemId: string
  slotId: string
  quantity: number
}

export interface PutawayRequest {
  lines: PutawayLineRequest[]
}

export interface InboundAllowedActionsResponse {
  allowedActions: InboundReceiptAction[]
}

export type InboundReceiptListResponse = PagedResponse<InboundReceiptSummary>
export type ReceivingTaskListResponse = PagedResponse<ReceivingTask>
