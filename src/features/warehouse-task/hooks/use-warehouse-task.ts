import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/types/api'
import { warehouseTaskService } from '../services/warehouse-task.service'
import type {
  MyWarehouseTaskListResponse,
  MyWarehouseTaskQuery,
  WarehouseTaskScope,
} from '../types/warehouse-task.types'
import type { WarehouseTaskAction } from '../types/warehouse-task.types'

export function useMyWarehouseTasksQuery(
  params: MyWarehouseTaskQuery,
  scope: WarehouseTaskScope = 'mine'
) {
  return useQuery<MyWarehouseTaskListResponse, ApiErrorResponse>({
    queryKey: ['warehouse-tasks', scope, params],
    queryFn: () => warehouseTaskService.getCurrent(params, scope).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useManageMyWarehouseTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskType,
      taskId,
      action,
      reason,
    }: {
      taskType: string
      taskId: string
      action: WarehouseTaskAction
      reason?: string
    }) => warehouseTaskService.action(taskType, taskId, action, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-warehouse-tasks'] }),
  })
}

export function useMyWarehouseTaskHistoryQuery(
  params: MyWarehouseTaskQuery,
  scope: WarehouseTaskScope = 'mine'
) {
  return useQuery<MyWarehouseTaskListResponse, ApiErrorResponse>({
    queryKey: ['warehouse-tasks', scope, 'history', params],
    queryFn: () => warehouseTaskService.getHistory(params, scope).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}
