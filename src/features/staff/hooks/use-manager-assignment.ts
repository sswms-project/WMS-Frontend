import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import { managerAssignmentService } from '../services/manager-assignment.service'
import type {
  AssignManagerRequest,
  UpdateStaffWarehousesRequest,
  WarehouseAssignmentQuery,
  WarehouseSummaryResponse,
} from '../types/manager-assignment.types'

interface AssignManagerVariables {
  warehouseId: string
  request: AssignManagerRequest
}

export function useStaffWarehouseAssignmentsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.staff.warehouseAssignments(userId),
    queryFn: () => managerAssignmentService.getStaffWarehouses(userId),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useUpdateStaffWarehousesMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateStaffWarehousesRequest>({
    mutationFn: (request) => managerAssignmentService.updateStaffWarehouses(userId, request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all }),
      ])
    },
    onError: (error) => logger.error(error),
  })
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

const invitationWarehousePageSize = 100

export function useInvitationWarehousesInfiniteQuery(searchText: string, enabled = true) {
  return useInfiniteQuery<QueryResult<WarehouseSummaryResponse>, ApiErrorResponse>({
    queryKey: queryKeys.warehouses.invitationOptions(searchText),
    queryFn: ({ pageParam }) =>
      managerAssignmentService
        .getWarehouses({
          top: invitationWarehousePageSize,
          skip: pageParam as number,
          needTotalCount: true,
          status: 'Active',
          ...(searchText ? { searchText } : {}),
        })
        .then((response) => response.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((count, page) => count + page.items.length, 0)
      return loadedCount < lastPage.totalCount ? loadedCount : undefined
    },
    enabled,
    staleTime: 5 * 60 * 1000,
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
