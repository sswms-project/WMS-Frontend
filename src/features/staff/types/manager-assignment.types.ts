import type { QueryInfo } from '@/types/api'
import type { WarehouseResponse } from '@/types/warehouse'

export type WarehouseSummaryResponse = WarehouseResponse

export interface WarehouseAssignmentQuery extends QueryInfo {
  top: number
  skip: number
  needTotalCount: true
  status?: 'Active' | 'Inactive'
}

export interface AssignManagerRequest {
  managerId: string
}
