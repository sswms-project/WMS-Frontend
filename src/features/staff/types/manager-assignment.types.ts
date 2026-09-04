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
  expectedManagerId?: string
}

export interface StaffWarehouseOption {
  id: string
  warehouseCode: string
  warehouseName: string
  status: string
  managerId: string | null
  managerName: string | null
}

export interface StaffWarehouseAssignments {
  assignedWarehouseIds: string[]
  warehouses: StaffWarehouseOption[]
}

export type { UpdateStaffWarehousesRequest } from '../schemas/update-staff-warehouses.schema'
