import type { QueryInfo } from '@/types/api'

export interface WarehouseListQuery extends QueryInfo {
  top: number
  skip: number
  needTotalCount: true
}

export interface CreateWarehouseRequest {
  warehouseCode: string
  warehouseName: string
  address: string | null
}

export interface UpdateWarehouseRequest {
  warehouseName: string
  address: string | null
}
