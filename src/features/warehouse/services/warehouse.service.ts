import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type { WarehouseDetailResponse, WarehouseResponse, ZoneResponse } from '@/types/warehouse'
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseListQuery,
} from '../types/warehouse.types'

export const warehouseService = {
  getWarehouses: (params: WarehouseListQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<WarehouseResponse>>>(API_ENDPOINTS.warehouses.list, { params })
      .then((response) => response.data),

  createWarehouse: (request: CreateWarehouseRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.warehouses.create, request)
      .then((response) => response.data),

  getWarehouse: (warehouseId: string) =>
    axiosClient
      .get<ApiResponse<WarehouseDetailResponse>>(API_ENDPOINTS.warehouses.detail(warehouseId))
      .then((response) => response.data),

  updateWarehouse: (warehouseId: string, request: UpdateWarehouseRequest) =>
    axiosClient
      .put<
        ApiResponse<WarehouseDetailResponse>
      >(API_ENDPOINTS.warehouses.update(warehouseId), request)
      .then((response) => response.data),

  getLayout: (warehouseId: string) =>
    axiosClient
      .get<ApiResponse<ZoneResponse[]>>(API_ENDPOINTS.warehouses.layout(warehouseId))
      .then((response) => response.data),

  deactivateWarehouse: (warehouseId: string) =>
    axiosClient
      .patch<ApiResponse<unknown>>(API_ENDPOINTS.warehouses.deactivate(warehouseId))
      .then((response) => response.data),
}
