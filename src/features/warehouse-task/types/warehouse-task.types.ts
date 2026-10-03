export const WAREHOUSE_TASK_TYPES = [
  'Receiving',
  'PutAway',
  'CycleCount',
  'DamagedStock',
  'Relocation',
] as const

export type WarehouseTaskType = (typeof WAREHOUSE_TASK_TYPES)[number]

export interface MyWarehouseTask {
  id: string
  taskType: WarehouseTaskType
  referenceCode: string
  title: string
  warehouseId: string
  warehouseName: string
  status: string
  executionStatus: 'Queued' | 'InProgress' | 'Paused' | 'Completed' | 'Cancelled'
  priority: 'Normal' | 'Urgent'
  pauseReason: string | null
  assignedTo: string | null
  assignedToName: string | null
  assignedAt: string
  updatedAt: string
}

export type WarehouseTaskAction = 'Start' | 'Pause' | 'Return'

export interface MyWarehouseTaskQuery {
  pageNumber: number
  pageSize: number
  taskType?: WarehouseTaskType
  warehouseId?: string
  status?: string
}

export type WarehouseTaskScope = 'mine' | 'managed'

export interface MyWarehouseTaskListResponse {
  items: MyWarehouseTask[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface WarehouseTaskLine {
  id: string
  productId: string
  sku: string
  productName: string
  sourceInventoryStockId: string
  sourceSlotId: string
  sourceSlotCode: string
  proposedDestinationSlotId: string | null
  proposedDestinationSlotCode: string | null
  quantity: number
  completedQuantity: number
  remainingQuantity: number
}

export interface WarehouseTaskDetail {
  id: string
  taskCode: string
  taskType: 'Relocation'
  warehouseId: string
  warehouseName: string
  executionStatus: MyWarehouseTask['executionStatus']
  priority: MyWarehouseTask['priority']
  reason: string
  dueAt: string | null
  assignedTo: string | null
  assignedToName: string | null
  assignedAt: string | null
  rowVersion: string
  lines: WarehouseTaskLine[]
  executions: WarehouseTaskExecution[]
}

export interface WarehouseTaskExecution {
  id: string
  warehouseTaskLineId: string
  sourceSlotId: string
  sourceSlotCode: string
  destinationSlotId: string
  destinationSlotCode: string
  quantity: number
  performedBy: string
  recommendationRank: number | null
  recommendationScore: number | null
  recommendationReasons: string | null
  overrideReason: string | null
  executedAt: string
}

export interface WarehousePlacementRecommendation {
  slotId: string
  slotCode: string
  slotName: string
  zoneCode: string
  rackCode: string
  rank: number
  score: number
  remainingCapacity: number | null
  capacityUnitName: string | null
  reasons: string[]
}

export interface CreateWarehouseTaskRequest {
  warehouseId: string
  priority: MyWarehouseTask['priority']
  dueAt: string | null
  reason: string
  commandId: string
  lines: Array<{
    sourceInventoryStockId: string
    quantity: number
    proposedDestinationSlotId: string | null
  }>
}

export interface AssignWarehouseTaskRequest {
  staffId: string
  expectedStaffId: string | null
  expectedVersion: string
  reason: string | null
}

export interface ExecuteWarehouseRelocationRequest {
  lineId: string
  destinationSlotId: string
  quantity: number
  commandId: string
  expectedVersion: string
  overrideReason: string | null
}
