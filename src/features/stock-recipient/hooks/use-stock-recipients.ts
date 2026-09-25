import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { stockRecipientService } from '../services/stock-recipient.service'
import type {
  CreateStockRecipientRequest,
  StockRecipient,
  StockRecipientListQuery,
  StockRecipientListResponse,
  StockRecipientIssueHistoryQuery,
  StockRecipientIssueHistoryResponse,
  UpdateStockRecipientRequest,
} from '../types/stock-recipient.types'

interface UpdateStockRecipientVariables {
  stockRecipientId: string
  request: UpdateStockRecipientRequest
}

export function useStockRecipientsQuery(params: StockRecipientListQuery) {
  return useQuery<StockRecipientListResponse, ApiErrorResponse>({
    queryKey: queryKeys.stockRecipients.list(params),
    queryFn: () =>
      stockRecipientService.getStockRecipients(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useNextStockRecipientCodeQuery(enabled: boolean) {
  return useQuery<ApiResponse<string>, ApiErrorResponse>({
    queryKey: queryKeys.stockRecipients.nextCode,
    queryFn: stockRecipientService.getNextCode,
    enabled,
  })
}

export function useStockRecipientQuery(stockRecipientId: string) {
  return useQuery<StockRecipient, ApiErrorResponse>({
    queryKey: queryKeys.stockRecipients.detail(stockRecipientId),
    queryFn: () =>
      stockRecipientService.getStockRecipient(stockRecipientId).then((response) => response.data),
  })
}

export function useStockRecipientIssueHistoryQuery(
  stockRecipientId: string,
  params: StockRecipientIssueHistoryQuery
) {
  return useQuery<StockRecipientIssueHistoryResponse, ApiErrorResponse>({
    queryKey: queryKeys.stockRecipients.issueHistory(stockRecipientId, params),
    queryFn: () =>
      stockRecipientService
        .getIssueHistory(stockRecipientId, params)
        .then((response) => response.data),
  })
}

export function useCreateStockRecipientMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateStockRecipientRequest>({
    mutationFn: stockRecipientService.createStockRecipient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stockRecipients.all }),
    onError: (error) => logger.error(error),
  })
}

export function useUpdateStockRecipientMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateStockRecipientVariables>({
    mutationFn: ({ stockRecipientId, request }) =>
      stockRecipientService.updateStockRecipient(stockRecipientId, request),
    onSuccess: (_, { stockRecipientId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stockRecipients.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.stockRecipients.detail(stockRecipientId),
        }),
      ]),
    onError: (error) => logger.error(error),
  })
}

export function useChangeStockRecipientStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    { stockRecipientId: string; status: 'Active' | 'Inactive' }
  >({
    mutationFn: ({ stockRecipientId, status }) =>
      stockRecipientService.changeStatus(stockRecipientId, status),
    onSuccess: (_, { stockRecipientId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stockRecipients.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.stockRecipients.detail(stockRecipientId),
        }),
      ]),
    onError: (error) => logger.error(error),
  })
}
