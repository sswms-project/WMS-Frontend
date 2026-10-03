import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  MyWarehouseTaskListResponse,
  MyWarehouseTaskQuery,
  WarehouseTaskAction,
  WarehouseTaskScope,
} from '../types/warehouse-task.types'

export const warehouseTaskService = {
  getCurrent: (params: MyWarehouseTaskQuery, scope: WarehouseTaskScope = 'mine') =>
    axiosClient
      .get<
        ApiResponse<MyWarehouseTaskListResponse>
      >(scope === 'managed' ? API_ENDPOINTS.warehouseTasks.list : API_ENDPOINTS.myWarehouseTasks.list, { params })
      .then((response) => response.data),
  getHistory: (params: MyWarehouseTaskQuery, scope: WarehouseTaskScope = 'mine') =>
    axiosClient
      .get<ApiResponse<MyWarehouseTaskListResponse>>(
        scope === 'managed'
          ? API_ENDPOINTS.warehouseTasks.history
          : API_ENDPOINTS.myWarehouseTasks.history,
        {
          params,
        }
      )
      .then((response) => response.data),
  action: (taskType: string, taskId: string, action: WarehouseTaskAction, reason?: string) =>
    axiosClient.post(API_ENDPOINTS.myWarehouseTasks.action(taskType, taskId), { action, reason }),
}
