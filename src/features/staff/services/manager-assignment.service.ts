import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type {
  AssignManagerRequest,
  WarehouseAssignmentQuery,
  WarehouseSummaryResponse,
} from '../types/manager-assignment.types'

export const managerAssignmentService = {
  getWarehouses: (params: WarehouseAssignmentQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<WarehouseSummaryResponse>>>(API_ENDPOINTS.warehouses.list, {
        params,
      })
      .then((response) => response.data),

  assignManager: (warehouseId: string, request: AssignManagerRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.staff.assignManager(warehouseId), request)
      .then((response) => response.data),
}
