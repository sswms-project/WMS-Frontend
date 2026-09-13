import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type {
  AssignManagerRequest,
  StaffWarehouseAssignments,
  UpdateStaffWarehousesRequest,
  WarehouseAssignmentQuery,
  WarehouseSummaryResponse,
} from '../types/manager-assignment.types'

export const managerAssignmentService = {
  getStaffWarehouses: (userId: string) =>
    axiosClient
      .get<ApiResponse<StaffWarehouseAssignments>>(API_ENDPOINTS.staff.warehouseAssignments(userId))
      .then((response) => response.data.data),

  updateStaffWarehouses: (userId: string, request: UpdateStaffWarehousesRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.staff.warehouseAssignments(userId), request)
      .then((response) => response.data),

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
