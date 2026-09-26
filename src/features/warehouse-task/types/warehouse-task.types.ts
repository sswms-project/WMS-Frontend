export const WAREHOUSE_TASK_TYPES = ['Receiving', 'PutAway', 'CycleCount', 'DamagedStock'] as const

export type WarehouseTaskType = (typeof WAREHOUSE_TASK_TYPES)[number]

export interface MyWarehouseTask {
  id: string
  taskType: WarehouseTaskType
  referenceCode: string
  title: string
  warehouseId: string
  warehouseName: string
  status: string
  executionStatus: 'Queued' | 'InProgress' | 'Paused' | 'Completed'
  priority: 'Normal' | 'Urgent'
  pauseReason: string | null
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

export interface MyWarehouseTaskListResponse {
  items: MyWarehouseTask[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
