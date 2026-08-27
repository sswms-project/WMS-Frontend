export const CYCLE_COUNT_STATUSES = {
  scheduled: 'Scheduled',
  counting: 'Counting',
  submitted: 'Submitted',
  recount: 'Recount',
  completed: 'Completed',
} as const

export type CycleCountStatus = (typeof CYCLE_COUNT_STATUSES)[keyof typeof CYCLE_COUNT_STATUSES]

export const STOCK_ADJUSTMENT_STATUSES = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
} as const

export type StockAdjustmentStatus =
  (typeof STOCK_ADJUSTMENT_STATUSES)[keyof typeof STOCK_ADJUSTMENT_STATUSES]

export interface CycleCountListQuery {
  pageNumber: number
  pageSize: number
  warehouseId?: string
  status?: CycleCountStatus
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
}

export interface CycleCountSummary {
  id: string
  warehouseId: string
  warehouseName: string
  zoneId: string | null
  status: CycleCountStatus
  scheduledDate: string
  isBlindCount: boolean
  assignedTo: string | null
  assignedToName: string
  itemCount: number
  countedItemCount: number
  createdAt: string
}

export interface CycleCountListResponse {
  items: CycleCountSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CycleCountItemHistory {
  id: string
  recountRound: number
  countedQuantity: number
  countedBy: string
  countedAt: string
  recountRequestedBy: string
  recountRequestedAt: string
  recountReason: string
}

export interface CycleCountItem {
  id: string
  productId: string
  productName: string
  productSku: string
  slotId: string
  slotCode: string
  systemQuantity: number | null
  countedQuantity: number | null
  difference: number | null
  countedBy: string | null
  countedAt: string | null
  requestedRecountRound: number | null
  activeAdjustmentId: string | null
  activeAdjustmentStatus: StockAdjustmentStatus | null
  countHistory: CycleCountItemHistory[]
}

export interface CycleCountDetail {
  id: string
  warehouseId: string
  warehouseName: string
  zoneId: string | null
  zoneName: string | null
  status: CycleCountStatus
  scheduledDate: string
  isBlindCount: boolean
  recountRound: number
  assignedTo: string | null
  assignedToName: string
  submittedBy: string | null
  submittedAt: string | null
  completedAt: string | null
  createdAt: string
  items: CycleCountItem[]
}

export interface AllowedActionsResponse {
  allowedActions: string[]
}

export interface CreateCycleCountRequest {
  warehouseId: string
  zoneId: string | null
  scheduledDate: string
  assignedTo: string
  items: Array<{ productId: string; slotId: string }>
  isBlindCount: boolean
}

export interface RequestRecountRequest {
  itemIds: string[]
  reason: string
}

export interface CreateStockAdjustmentRequest {
  cycleCountItemId: string
  reason: string
}

export interface RejectStockAdjustmentRequest {
  reason: string
}

export interface StockAdjustmentListQuery {
  pageNumber: number
  pageSize: number
  warehouseId?: string
  status?: StockAdjustmentStatus
  productId?: string
  createdBy?: string
  dateFrom?: string
  dateTo?: string
}

export interface StockAdjustment {
  id: string
  cycleCountItemId: string | null
  cycleCountId: string | null
  productId: string
  productName: string
  productSku: string
  warehouseId: string
  warehouseName: string
  slotId: string
  slotCode: string
  quantityChange: number
  systemQuantity: number | null
  countedQuantity: number | null
  reason: string
  status: StockAdjustmentStatus
  createdAt: string
  createdBy: string
  createdByName: string
  approvedBy: string | null
  approvedByName: string | null
  approvedAt: string | null
  rejectedBy: string | null
  rejectedByName: string | null
  rejectedAt: string | null
  rejectionReason: string | null
}

export interface StockAdjustmentListResponse {
  items: StockAdjustment[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
