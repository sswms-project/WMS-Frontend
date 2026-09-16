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
  isLotTracked: boolean
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
  activeDocumentImportId: string | null
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
  lotId: string | null
  lotNumber: string | null
  manufacturedDate: string | null
  expiryDate: string | null
  orderedQuantity: number
  receivedQuantity: number
  damagedQuantity: number
  usableQuantity: number
  putAwayQuantity: number
  remainingPutAwayQuantity: number
  exceptionReason: string | null
  putAwayDetails: PutAwayDetail[]
}

export interface PutAwayDetail {
  id: string
  inventoryStockId: string
  stockMovementId: string
  warehouseId: string
  slotId: string
  slotCode: string
  lotId: string | null
  lotNumber: string | null
  qualityStatus: string
  performedByUserId: string
  performedByName: string
  quantity: number
  putAwayAt: string
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
  lotNumber: string | null
  manufacturedDate: string | null
  expiryDate: string | null
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

export const INBOUND_DOCUMENT_IMPORT_STATUSES = [
  'Pending',
  'Uploaded',
  'Scanning',
  'Processing',
  'NeedsReview',
  'ReadyForDraft',
  'DraftReceiptCreated',
  'Completed',
  'Failed',
  'Cancelled',
] as const

export type InboundDocumentImportStatus = (typeof INBOUND_DOCUMENT_IMPORT_STATUSES)[number]

export interface ExtractedField<T> {
  value: T | null
  rawValue: string | null
  confidence: number | null
  source:
    | 'AiExtracted'
    | 'DocumentParser'
    | 'PurchaseOrder'
    | 'SupplierMaster'
    | 'WarehouseMaster'
    | 'SystemGenerated'
    | 'UserEdited'
  verificationStatus:
    | 'Unverified'
    | 'Matched'
    | 'LowConfidence'
    | 'Mismatch'
    | 'UserConfirmed'
    | 'UserCorrected'
    | 'NotProvided'
}

export interface SupplierDocumentExtraction {
  schemaVersion: string
  documentNumber: ExtractedField<string> | null
  purchaseOrderNumber: ExtractedField<string> | null
  supplierName: ExtractedField<string> | null
  documentDate: ExtractedField<string> | null
  supplierDeliveryDate: ExtractedField<string> | null
  warehouseCode: ExtractedField<string> | null
  warehouseName: ExtractedField<string> | null
  items: SupplierDocumentLineExtraction[]
}

export interface SupplierDocumentLineExtraction {
  sourceLineNumber: number
  sku: ExtractedField<string> | null
  productName: ExtractedField<string> | null
  unitOfMeasure: ExtractedField<string> | null
  deliveredQuantity: ExtractedField<number> | null
  damagedQuantity: ExtractedField<number> | null
}

export interface InboundDocumentReviewLine {
  sourceLineNumber: number
  extractedSku: string | null
  extractedProductName: string | null
  extractedUnitOfMeasure: string | null
  documentQuantity: number | null
  purchaseOrderItemId: string | null
  productId: string | null
  productSku: string | null
  productName: string | null
  unitName: string | null
  orderedQuantity: number
  previouslyReceivedQuantity: number
  remainingQuantity: number
  confirmedQuantity: number
  damagedQuantity: number
  exceptionReason: string | null
  isLotTracked: boolean
  lotNumber: string | null
  manufacturedDate: string | null
  expiryDate: string | null
  status: string
  isUserCorrected: boolean
}

export interface InboundDocumentReview {
  extraction: SupplierDocumentExtraction
  purchaseOrderId: string | null
  purchaseOrderNumber: string | null
  supplierId: string | null
  supplierName: string | null
  warehouseId: string | null
  warehouseCode: string | null
  warehouseName: string | null
  warehouseAddress: string | null
  expectedReceiptDate: string | null
  hasWarehouseMismatch: boolean
  warehouseMismatchAcknowledged: boolean
  lines: InboundDocumentReviewLine[]
  warnings: string[]
  blockingErrors: string[]
  canCreateDraft: boolean
}

export interface InboundDocumentImport {
  id: string
  fileName: string
  contentType: string
  fileSize: number
  status: InboundDocumentImportStatus
  schemaVersion: string
  failureCode: string | null
  failureMessage: string | null
  extractionProvider: string | null
  extractionModel: string | null
  createdAt: string
  reviewedAt: string | null
  inboundReceiptId: string | null
  duplicateFileDetected: boolean
  review: InboundDocumentReview | null
}

export interface StartInboundDocumentImportRequest {
  file: File
  purchaseOrderId?: string
  warehouseId?: string
}

export interface ReviewInboundDocumentLineRequest {
  sourceLineNumber: number
  purchaseOrderItemId: string
  confirmedQuantity: number
  damagedQuantity: number
  exceptionReason: string | null
  lotNumber: string | null
  manufacturedDate: string | null
  expiryDate: string | null
}

export interface ReviewInboundDocumentImportRequest {
  id: string
  purchaseOrderId: string
  acknowledgeWarehouseMismatch: boolean
  lines: ReviewInboundDocumentLineRequest[]
}
