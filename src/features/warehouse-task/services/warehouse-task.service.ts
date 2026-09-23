import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  MyWarehouseTaskListResponse,
  MyWarehouseTaskQuery,
  WarehouseTaskAction,
} from '../types/warehouse-task.types'

export const warehouseTaskService = {
  getCurrent: (params: MyWarehouseTaskQuery) =>
    axiosClient
      .get<
        ApiResponse<MyWarehouseTaskListResponse>
      >(API_ENDPOINTS.myWarehouseTasks.list, { params })
      .then((response) => response.data),
  getHistory: (params: MyWarehouseTaskQuery) =>
    axiosClient
      .get<ApiResponse<MyWarehouseTaskListResponse>>(API_ENDPOINTS.myWarehouseTasks.history, {
        params,
      })
      .then((response) => response.data),
  action: (taskType: string, taskId: string, action: WarehouseTaskAction, reason?: string) =>
    axiosClient.post(API_ENDPOINTS.myWarehouseTasks.action(taskType, taskId), { action, reason }),
}
