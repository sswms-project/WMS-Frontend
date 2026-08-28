import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { cycleCountService } from '../services/cycle-count.service'
import type {
  AllowedActionsResponse,
  CreateCycleCountRequest,
  CreateStockAdjustmentRequest,
  CycleCountDetail,
  CycleCountListQuery,
  CycleCountListResponse,
  RejectStockAdjustmentRequest,
  RequestRecountRequest,
  StockAdjustment,
  StockAdjustmentListQuery,
  StockAdjustmentListResponse,
} from '../types/cycle-count.types'

export function useCycleCountsQuery(params: CycleCountListQuery) {
  return useQuery<CycleCountListResponse, ApiErrorResponse>({
    queryKey: queryKeys.cycleCounts.list(params),
    queryFn: () => cycleCountService.getCycleCounts(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useCycleCountQuery(cycleCountId: string) {
  return useQuery<CycleCountDetail, ApiErrorResponse>({
    queryKey: queryKeys.cycleCounts.detail(cycleCountId),
    queryFn: () => cycleCountService.getCycleCount(cycleCountId).then((response) => response.data),
    enabled: Boolean(cycleCountId),
  })
}

export function useCycleCountAllowedActionsQuery(cycleCountId: string) {
  return useQuery<AllowedActionsResponse, ApiErrorResponse>({
    queryKey: queryKeys.cycleCounts.allowedActions(cycleCountId),
    queryFn: () =>
      cycleCountService.getCycleCountAllowedActions(cycleCountId).then((response) => response.data),
    enabled: Boolean(cycleCountId),
  })
}

function useInvalidateCycleCount() {
  const queryClient = useQueryClient()
  return async (cycleCountId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.cycleCounts.all }),
      ...(cycleCountId
        ? [
            queryClient.invalidateQueries({ queryKey: queryKeys.cycleCounts.detail(cycleCountId) }),
            queryClient.invalidateQueries({
              queryKey: queryKeys.cycleCounts.allowedActions(cycleCountId),
            }),
          ]
        : []),
    ])
  }
}

export function useCreateCycleCountMutation() {
  const invalidate = useInvalidateCycleCount()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateCycleCountRequest>({
    mutationFn: cycleCountService.createCycleCount,
    onSuccess: async () => invalidate(),
    onError: (error) => logger.error(error),
  })
}

export function useRecordCycleCountItemMutation() {
  const invalidate = useInvalidateCycleCount()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    { cycleCountId: string; itemId: string; countedQuantity: number }
  >({
    mutationFn: cycleCountService.recordCycleCountItem,
    onSuccess: async (_, variables) => invalidate(variables.cycleCountId),
    onError: (error) => logger.error(error),
  })
}

function useCycleCountActionMutation(
  mutationFn: (cycleCountId: string) => Promise<ApiResponse<unknown>>
) {
  const invalidate = useInvalidateCycleCount()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn,
    onSuccess: async (_, cycleCountId) => invalidate(cycleCountId),
    onError: (error) => logger.error(error),
  })
}

export function useSubmitCycleCountMutation() {
  return useCycleCountActionMutation(cycleCountService.submitCycleCount)
}

export function useFinalizeCycleCountMutation() {
  return useCycleCountActionMutation(cycleCountService.finalizeCycleCount)
}

export function useRequestRecountMutation() {
  const invalidate = useInvalidateCycleCount()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    { cycleCountId: string; request: RequestRecountRequest }
  >({
    mutationFn: cycleCountService.requestRecount,
    onSuccess: async (_, variables) => invalidate(variables.cycleCountId),
    onError: (error) => logger.error(error),
  })
}

export function useStockAdjustmentsQuery(params: StockAdjustmentListQuery) {
  return useQuery<StockAdjustmentListResponse, ApiErrorResponse>({
    queryKey: queryKeys.stockAdjustments.list(params),
    queryFn: () => cycleCountService.getStockAdjustments(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useStockAdjustmentQuery(adjustmentId: string) {
  return useQuery<StockAdjustment, ApiErrorResponse>({
    queryKey: queryKeys.stockAdjustments.detail(adjustmentId),
    queryFn: () =>
      cycleCountService.getStockAdjustment(adjustmentId).then((response) => response.data),
    enabled: Boolean(adjustmentId),
  })
}

export function useStockAdjustmentAllowedActionsQuery(adjustmentId: string) {
  return useQuery<AllowedActionsResponse, ApiErrorResponse>({
    queryKey: queryKeys.stockAdjustments.allowedActions(adjustmentId),
    queryFn: () =>
      cycleCountService
        .getStockAdjustmentAllowedActions(adjustmentId)
        .then((response) => response.data),
    enabled: Boolean(adjustmentId),
  })
}

function useInvalidateStockAdjustment() {
  const queryClient = useQueryClient()
  return async (adjustmentId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.stockAdjustments.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      ...(adjustmentId
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.stockAdjustments.detail(adjustmentId),
            }),
            queryClient.invalidateQueries({
              queryKey: queryKeys.stockAdjustments.allowedActions(adjustmentId),
            }),
          ]
        : []),
    ])
  }
}

export function useCreateStockAdjustmentMutation() {
  const invalidate = useInvalidateStockAdjustment()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateStockAdjustmentRequest>({
    mutationFn: cycleCountService.createStockAdjustment,
    onSuccess: async () => invalidate(),
    onError: (error) => logger.error(error),
  })
}

export function useApproveStockAdjustmentMutation() {
  const invalidate = useInvalidateStockAdjustment()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: cycleCountService.approveStockAdjustment,
    onSuccess: async (_, adjustmentId) => invalidate(adjustmentId),
    onError: (error) => logger.error(error),
  })
}

export function useRejectStockAdjustmentMutation() {
  const invalidate = useInvalidateStockAdjustment()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    { adjustmentId: string; request: RejectStockAdjustmentRequest }
  >({
    mutationFn: cycleCountService.rejectStockAdjustment,
    onSuccess: async (_, variables) => invalidate(variables.adjustmentId),
    onError: (error) => logger.error(error),
  })
}
