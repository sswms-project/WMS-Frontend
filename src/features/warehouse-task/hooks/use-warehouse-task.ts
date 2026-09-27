import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/types/api'
import { warehouseTaskService } from '../services/warehouse-task.service'
import type {
  MyWarehouseTaskListResponse,
  MyWarehouseTaskQuery,
} from '../types/warehouse-task.types'
import type { WarehouseTaskAction } from '../types/warehouse-task.types'

export function useMyWarehouseTasksQuery(params: MyWarehouseTaskQuery) {
  return useQuery<MyWarehouseTaskListResponse, ApiErrorResponse>({
    queryKey: ['my-warehouse-tasks', params],
    queryFn: () => warehouseTaskService.getCurrent(params).then((response) => response.data),
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

export function useMyWarehouseTaskHistoryQuery(params: MyWarehouseTaskQuery) {
  return useQuery<MyWarehouseTaskListResponse, ApiErrorResponse>({
    queryKey: ['my-warehouse-tasks', 'history', params],
    queryFn: () => warehouseTaskService.getHistory(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}
