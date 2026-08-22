import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import { managerAssignmentService } from '../services/manager-assignment.service'
import type {
  AssignManagerRequest,
  WarehouseAssignmentQuery,
  WarehouseSummaryResponse,
} from '../types/manager-assignment.types'

interface AssignManagerVariables {
  warehouseId: string
  request: AssignManagerRequest
}

export function useAssignmentWarehousesQuery(params: WarehouseAssignmentQuery, enabled: boolean) {
  return useQuery<QueryResult<WarehouseSummaryResponse>, ApiErrorResponse>({
    queryKey: queryKeys.warehouses.list(params),
    queryFn: () => managerAssignmentService.getWarehouses(params).then((response) => response.data),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}

export function useAssignManagerMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, AssignManagerVariables>({
    mutationFn: ({ warehouseId, request }) =>
      managerAssignmentService.assignManager(warehouseId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
    onError: (error) => logger.error(error),
  })
}
