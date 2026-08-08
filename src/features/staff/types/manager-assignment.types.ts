import type { QueryInfo } from '@/types/api'

export interface WarehouseSummaryResponse {
  id: string
  warehouseCode: string
  warehouseName: string
  address: string | null
  status: string
  createdAt: string
}

export interface WarehouseAssignmentQuery extends QueryInfo {
  top: number
  skip: number
  needTotalCount: true
}

export interface AssignManagerRequest {
  managerId: string
}
