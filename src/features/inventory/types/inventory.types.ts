export interface InventoryListQuery {
  pageNumber: number
  pageSize: number
  warehouseId?: string
  zoneId?: string
  rackId?: string
  slotId?: string
  productId?: string
  searchTerm?: string
}

export type QualityStatus = 'Good' | 'Damaged' | 'Quarantine'

export interface InventoryStock {
  id: string
  productId: string
  sku: string
  productName: string
  warehouseId: string
  warehouseName: string
  slotId: string
  slotCode: string
  lotId: string | null
  lotNumber: string | null
  manufacturedDate: string | null
  expiryDate: string | null
  lotStatus: string | null
  unitName?: string | null
  qualityStatus: QualityStatus
  quantityOnHand: number
  reservedQuantity: number
  availableQuantity: number
  updatedAt: string | null
}

export interface InventoryStockListResponse {
  items: InventoryStock[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface InventoryFilterOption {
  value: string
  label: string
}

export const STOCK_MOVEMENT_TYPES = {
  inbound: 'Inbound',
  putAway: 'PutAway',
  pick: 'Pick',
  issue: 'Issue',
  transferOut: 'TransferOut',
  transferIn: 'TransferIn',
  adjustment: 'Adjustment',
  returnIn: 'ReturnIn',
  scrap: 'Scrap',
} as const

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[keyof typeof STOCK_MOVEMENT_TYPES]

export interface StockMovementListQuery {
  pageNumber: number
  pageSize: number
  productId?: string
  warehouseId?: string
  movementType?: StockMovementType
  dateFrom?: string
  dateTo?: string
}

export interface StockMovement {
  id: string
  productId: string
  sku: string
  productName: string
  slotId: string
  slotCode: string
  lotId: string | null
  lotNumber: string | null
  qualityStatus: QualityStatus
  quantityChange: number
  balanceAfter: number
  unitCost: number | null
  movementType: StockMovementType
  referenceType: string
  referenceId: string
  performedByUserId: string
  performedByName: string
  occurredAt: string
  createdAt: string
}

export interface StockMovementListResponse {
  items: StockMovement[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface InventoryReservationQuery {
  warehouseId?: string
  productId?: string
  status?: InventoryReservationStatus
}

export type InventoryReservationStatus = 'Active' | 'Released' | 'Consumed'

export interface InventoryReservation {
  id: string
  inventoryStockId: string
  productId: string
  productSku: string
  productName: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  slotId: string
  slotCode: string
  lotId: string | null
  lotNumber: string | null
  qualityStatus: QualityStatus
  referenceType: 'StockIssuePick' | 'StockTransfer'
  referenceId: string
  referenceCode: string
  reservedQuantity: number
  status: InventoryReservationStatus
  createdByUserId: string
  createdByName: string
  releasedAt: string | null
  createdAt: string
}

export interface ReportDamagedStockRequest {
  productId: string
  warehouseId: string
  slotId: string
  lotId?: string
  quantity: number
  reason: string
}

export interface InventoryAbcQuery {
  warehouseId: string
}

export interface RunInventoryAbcRequest {
  warehouseId: string
  historicalPeriodDays: number
}

export interface InventoryAbcItem {
  warehouseId: string
  productId: string
  sku: string
  productName: string
  totalQuantity: number
  metricValue: number
  cumulativePercentage: number
  class: string
  calculationBasis: string
  analysisFrom: string
  analysisTo: string
}

export interface InventoryForecastQuery {
  productId: string
  warehouseId?: string
  horizonDays?: number
}

export interface ForecastPoint {
  date: string
  predictedQuantity: number
}

export interface InventoryForecastResponse {
  productId: string
  warehouseId: string | null
  modelName: string
  forecast: ForecastPoint[]
}

export type ForecastRunStatus = 'Pending' | 'Running' | 'Completed' | 'Failed'
export type ForecastSuggestionStatus = 'New' | 'Accepted' | 'Rejected' | 'Expired'

export interface CreateForecastRunRequest {
  warehouseId: string
  historicalPeriodDays: number
  horizonDays: number
}

export interface ForecastRunResult {
  id: string
  productId: string
  sku: string
  productName: string
  forecastDate: string
  forecastQuantity: number
  actualQuantity: number | null
  accuracyPercent: number | null
}

export interface ReplenishmentSuggestion {
  id: string
  productId: string
  sku: string
  productName: string
  warehouseId: string
  suggestedQuantity: number
  adjustedQuantity: number | null
  status: ForecastSuggestionStatus
  inboundRequestId: string | null
  acceptedByUserId: string | null
  acceptedAt: string | null
}

export interface RebalancingSuggestion {
  id: string
  productId: string
  sku: string
  productName: string
  sourceWarehouseId: string
  sourceWarehouseName: string
  destinationWarehouseId: string
  destinationWarehouseName: string
  suggestedQuantity: number
  status: ForecastSuggestionStatus
  stockTransferId: string | null
  acceptedByUserId: string | null
  acceptedAt: string | null
}

export interface ForecastRun {
  id: string
  warehouseId: string
  warehouseName: string
  createdByUserId: string
  createdByName: string
  method: string
  historicalPeriodDays: number
  forecastStartDate: string
  forecastEndDate: string
  status: ForecastRunStatus
  failureReason: string | null
  completedAt: string | null
  createdAt: string
  results: ForecastRunResult[]
  replenishmentSuggestions: ReplenishmentSuggestion[]
  rebalancingSuggestions: RebalancingSuggestion[]
}

export interface AcceptReplenishmentSuggestionRequest {
  supplierId: string
  adjustedQuantity: number | null
}

export interface AcceptRebalancingSuggestionRequest {
  destinationSlotId: string
  adjustedQuantity: number | null
}

export type ForecastSuggestionType = 'Replenishment' | 'Rebalancing'

export interface InventoryStockHistoryQuery {
  productId: string
  warehouseId?: string
  dateFrom?: string
  dateTo?: string
}

export interface StockHistoryPoint {
  date: string
  quantity: number
}

export interface InventoryStockHistoryResponse {
  productId: string
  warehouseId: string | null
  history: StockHistoryPoint[]
}
