export const TRANSFER_WORKFLOW_STATUSES = [
  'Draft',
  'InProgress',
  'AwaitingResolution',
  'Completed',
  'Cancelled',
] as const

export const TRANSFER_LEGACY_STATUSES = [
  'PendingSourceApproval',
  'Approved',
  'InTransit',
  'ReceivedWithVariance',
  'Rejected',
] as const

export type TransferWorkflowStatus = (typeof TRANSFER_WORKFLOW_STATUSES)[number]
export type TransferLegacyStatus = (typeof TRANSFER_LEGACY_STATUSES)[number]
export type TransferStatus = TransferWorkflowStatus | TransferLegacyStatus

export type TransferDispatchProgress = 'NotDispatched' | 'PartiallyDispatched' | 'Dispatched'
export type TransferReceiveProgress = 'NotReceived' | 'PartiallyReceived' | 'Received'

export type TransferShipmentStatus =
  | 'Picking'
  | 'InTransit'
  | 'Receiving'
  | 'Received'
  | 'ReceivedWithDiscrepancy'
  | 'Cancelled'

export type TransferShipmentLineStatus =
  | 'Pending'
  | 'Picking'
  | 'Picked'
  | 'PendingManager'
  | 'Dispatched'

export type TransferDiscrepancyType = 'Damaged' | 'Missing'

export type TransferFeedbackStatus = 'Open' | 'Answered' | 'Closed'

export const TRANSFER_FEEDBACK_REASONS = [
  'InsufficientStock',
  'DamagedStock',
  'CannotMeetDeadline',
  'Other',
] as const
export type TransferFeedbackReason = (typeof TRANSFER_FEEDBACK_REASONS)[number]

export const TRANSFER_PICK_REASONS = [
  'InsufficientAtLocation',
  'NotFound',
  'Damaged',
  'LocationBlocked',
  'LotExhausted',
  'NonFefoLot',
  'Other',
] as const
export type TransferPickReason = (typeof TRANSFER_PICK_REASONS)[number]

export const TRANSFER_RECEIPT_REASONS = ['TransitDamage', 'Lost', 'WrongShipment', 'Other'] as const
export type TransferReceiptReason = (typeof TRANSFER_RECEIPT_REASONS)[number]

export const TRANSFER_ESCALATION_ACTIONS = ['UseStock', 'ReduceQuantity', 'StopLine'] as const
export type TransferEscalationAction = (typeof TRANSFER_ESCALATION_ACTIONS)[number]

export const TRANSFER_DISCREPANCY_ACTIONS = [
  'LateReceipt',
  'ConfirmLoss',
  'AcknowledgeDamage',
] as const
export type TransferDiscrepancyAction = (typeof TRANSFER_DISCREPANCY_ACTIONS)[number]

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

export interface TransferAvailabilityQuery {
  sourceWarehouseId: string
  destinationWarehouseId: string
  productIds: string[]
}

export interface TransferSummary {
  id: string
  transferCode: string
  sourceWarehouseId: string
  sourceWarehouseName: string
  destinationWarehouseId: string
  destinationWarehouseName: string
  status: TransferStatus
  isLegacyWorkflow: boolean
  reason: string | null
  requiredBy: string | null
  createdAt: string
  createdBy: string
  createdByName: string | null
  lineCount: number
  requestedQuantity: number
  dispatchedQuantity: number
  receivedQuantity: number
  dispatchProgress: TransferDispatchProgress
  receiveProgress: TransferReceiveProgress
  hasOpenFeedback: boolean
  hasPendingPickEscalation: boolean
  version: string | null
}

export interface TransferListResponse {
  items: TransferSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface TransferItem {
  id: string
  productId: string
  productName: string
  sku: string
  sourceSlotId: string | null
  sourceSlotCode: string | null
  destinationSlotId: string | null
  destinationSlotCode: string | null
  quantity: number
  approvedQuantity: number
  dispatchedQuantity: number
  receivedQuantity: number
  damagedQuantity: number
  missingQuantity: number
  lotId: string | null
  lotNumber: string | null
  unitId: string | null
  unitName: string | null
  baseUnitId: string | null
  baseUnitName: string | null
  conversionFactor: number
  requestedQuantity: number
  batchedQuantity: number
  pickedQuantity: number
  resolvedMissingQuantity: number
  stoppedQuantity: number
  unbatchedQuantity: number
}

export interface TransferShipmentLine {
  id: string
  itemId: string
  productId: string
  sku: string
  productName: string
  plannedQuantity: number
  pickedQuantity: number
  dispatchedQuantity: number
  status: TransferShipmentLineStatus
  pendingReturnQuantity: number
  openExceptionCount: number
}

export interface TransferShipment {
  id: string
  shipmentNumber: number
  status: TransferShipmentStatus
  pickTaskId: string | null
  pickTaskCode: string | null
  pickTaskStatus: string | null
  pickAssigneeId: string | null
  receiveTaskId: string | null
  receiveTaskCode: string | null
  receiveTaskStatus: string | null
  receiveAssigneeId: string | null
  createdAt: string
  dispatchedAt: string | null
  receivedAt: string | null
  cancellationReason: string | null
  version: string | null
  lines: TransferShipmentLine[]
  pickTaskVersion: string | null
  receiveTaskVersion: string | null
}

export interface TransferDiscrepancy {
  id: string
  itemId: string
  shipmentId: string
  sku: string
  productName: string
  type: TransferDiscrepancyType
  quantity: number
  resolvedQuantity: number
  reasonCode: string | null
  note: string | null
  isOpen: boolean
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface TransferFeedback {
  id: string
  itemId: string | null
  reasonCode: TransferFeedbackReason
  message: string
  status: TransferFeedbackStatus
  reply: string | null
  authorId: string
  authorName: string | null
  createdAt: string
  repliedAt: string | null
}

export interface TransferDetail {
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
  isLegacyWorkflow: boolean
  createdByName: string | null
  reason: string | null
  requiredBy: string | null
  note: string | null
  submittedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  stoppedAt: string | null
  stopReason: string | null
  hasOpenFeedback: boolean
  version: string | null
  shipments: TransferShipment[] | null
  discrepancies: TransferDiscrepancy[] | null
  feedbacks: TransferFeedback[] | null
}

export interface TransferAvailabilityUnit {
  unitId: string
  unitName: string
  conversionFactor: number
  quantityPrecision: number
  availableQuantity: number
}

export interface TransferAvailability {
  productId: string
  sku: string
  productName: string
  baseUnitId: string
  baseUnitName: string
  availableQuantity: number
  units: TransferAvailabilityUnit[]
}

export interface TransferLineInput {
  itemId: string | null
  productId: string
  unitId: string | null
  quantity: number
}

export interface SaveTransferDraftRequest {
  expectedVersion: string | null
  sourceWarehouseId: string
  destinationWarehouseId: string
  reason: string | null
  requiredBy: string | null
  note: string | null
  items: TransferLineInput[]
}

export interface UpdateTransferRequest {
  expectedVersion: string
  sourceWarehouseId: string | null
  destinationWarehouseId: string | null
  reason: string | null
  requiredBy: string | null
  note: string | null
  items: TransferLineInput[]
}

export interface SubmitTransferRequest {
  expectedVersion: string | null
}

export interface CancelTransferRequest {
  reason: string
  expectedVersion: string | null
}

export interface AddTransferFeedbackRequest {
  itemId: string | null
  reasonCode: TransferFeedbackReason
  message: string
}

export interface ReplyTransferFeedbackRequest {
  reply: string
  close: boolean
}

export interface CreateTransferShipmentRequest {
  lines: Array<{ itemId: string; quantity: number | null }>
}

export interface CancelTransferShipmentRequest {
  reason: string
}

export interface RecordTransferPickRequest {
  lineId: string
  inventoryStockId: string
  quantity: number | null
  scannedSlotCode: string
  scannedProductCode: string | null
}

export interface SwitchTransferPickRequest {
  fromInventoryStockId: string
  toInventoryStockId: string
  quantity: number
  reasonCode: TransferPickReason
  note: string | null
}

export interface EscalateTransferPickRequest {
  reasonCode: TransferPickReason
  note: string
}

export interface ResolveTransferEscalationRequest {
  action: TransferEscalationAction
  fromInventoryStockId: string | null
  toInventoryStockId: string | null
  quantity: number | null
  note: string | null
}

export interface ReturnTransferPickRequest {
  pickDetailId: string
  quantity: number | null
  scannedSlotCode: string
}

export interface DispatchTransferShipmentRequest {
  expectedVersion: string
}

export interface TransferReceiptEntryRequest {
  lineId: string
  lotId: string | null
  destinationSlotId: string | null
  goodQuantity: number
  damagedQuantity: number
  missingQuantity: number
  reasonCode: string | null
  note: string | null
  scannedSlotCode: string | null
  scannedProductCode: string | null
}

export interface ReceiveTransferShipmentRequest {
  expectedVersion: string
  entries: TransferReceiptEntryRequest[]
}

export interface ResolveTransferDiscrepancyRequest {
  action: TransferDiscrepancyAction
  quantity: number | null
  lotId: string | null
  destinationSlotId: string | null
  scannedSlotCode: string | null
  note: string | null
}

export interface TransferPickSuggestion {
  inventoryStockId: string
  slotId: string
  slotCode: string
  slotBarcode: string | null
  lotId: string | null
  lotNumber: string | null
  expiryDate: string | null
  suggestedQuantity: number
  reservedQuantity: number
  rackCode: string | null
  isSystemDefaultSlot: boolean
}

export interface TransferPickAlternative {
  inventoryStockId: string
  slotId: string
  slotCode: string
  slotBarcode: string | null
  lotId: string | null
  lotNumber: string | null
  expiryDate: string | null
  availableQuantity: number
  rackCode: string | null
  isSystemDefaultSlot: boolean
}

export interface TransferPickDetail {
  id: string
  inventoryStockId: string
  slotCode: string
  lotId: string | null
  lotNumber: string | null
  pickedQuantity: number
  returnedQuantity: number
  dispatchedQuantity: number
  pickedAt: string
  rackCode: string | null
  isSystemDefaultSlot: boolean
}

export interface TransferPickException {
  id: string
  type: string
  reasonCode: string
  note: string | null
  quantity: number
  status: 'Resolved' | 'PendingManager'
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface TransferPickSheetLine {
  lineId: string
  itemId: string
  productId: string
  sku: string
  productName: string
  productBarcode: string | null
  baseUnitName: string
  plannedQuantity: number
  pickedQuantity: number
  remainingQuantity: number
  pendingReturnQuantity: number
  status: TransferShipmentLineStatus
  suggestions: TransferPickSuggestion[]
  picks: TransferPickDetail[]
  exceptions: TransferPickException[]
}

export interface TransferPickSheet {
  shipmentId: string
  shipmentNumber: number
  transferId: string
  transferCode: string
  sourceWarehouseId: string
  sourceWarehouseName: string
  destinationWarehouseId: string
  destinationWarehouseName: string
  shipmentStatus: TransferShipmentStatus
  version: string | null
  lines: TransferPickSheetLine[]
}

export interface TransferReceiveSheetLot {
  lotId: string | null
  lotNumber: string | null
  expiryDate: string | null
  dispatchedQuantity: number
  receivedQuantity: number
}

export interface TransferReceiveSheetLine {
  lineId: string
  itemId: string
  productId: string
  sku: string
  productName: string
  productBarcode: string | null
  baseUnitName: string
  suggestedSlotId: string | null
  suggestedSlotCode: string | null
  suggestedRackCode: string | null
  suggestedIsSystemDefaultSlot: boolean
  lots: TransferReceiveSheetLot[]
}

export interface TransferReceiveSheet {
  shipmentId: string
  shipmentNumber: number
  transferId: string
  transferCode: string
  destinationWarehouseId: string
  destinationWarehouseName: string
  shipmentStatus: TransferShipmentStatus
  version: string | null
  lines: TransferReceiveSheetLine[]
}
