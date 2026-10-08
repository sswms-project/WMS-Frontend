import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse, QueryResult } from '@/types/api'
import type { WarehouseResponse } from '@/types/warehouse'
import { transferService } from '../services/transfer.service'
import type {
  AddTransferFeedbackRequest,
  CancelTransferRequest,
  ReplyTransferFeedbackRequest,
  SaveTransferDraftRequest,
  SubmitTransferRequest,
  TransferAvailability,
  TransferAvailabilityQuery,
  TransferDetail,
  TransferListQuery,
  TransferListResponse,
  TransferSourceWarehouseQuery,
  UpdateTransferRequest,
} from '../types/transfer.types'

/** Mọi thao tác trên phiếu có thể đổi tồn kho, giữ chỗ và công việc được giao. */
export function invalidateTransferQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    queryClient.invalidateQueries({ queryKey: ['warehouse-tasks'] }),
  ])
}

export function useTransfersQuery(params: TransferListQuery, enabled = true) {
  return useQuery<TransferListResponse, ApiErrorResponse>({
    queryKey: queryKeys.transfers.list(params),
    queryFn: () => transferService.getTransfers(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useTransferQuery(transferId: string | null) {
  return useQuery<TransferDetail, ApiErrorResponse>({
    queryKey: queryKeys.transfers.detail(transferId ?? ''),
    queryFn: () => transferService.getTransfer(transferId ?? '').then((response) => response.data),
    enabled: Boolean(transferId),
  })
}

export function useTransferSourceWarehousesQuery(
  params: TransferSourceWarehouseQuery,
  enabled = true
) {
  return useQuery<QueryResult<WarehouseResponse>, ApiErrorResponse>({
    queryKey: queryKeys.transfers.sourceWarehouses(params),
    queryFn: () => transferService.getSourceWarehouses(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useTransferAvailabilityQuery(query: TransferAvailabilityQuery, enabled = true) {
  return useQuery<TransferAvailability[], ApiErrorResponse>({
    queryKey: queryKeys.transfers.availability(query),
    queryFn: () => transferService.getAvailability(query).then((response) => response.data),
    enabled: enabled && query.productIds.length > 0,
    placeholderData: (previousData) => previousData,
  })
}

interface SaveDraftVariables {
  transferId: string | null
  request: SaveTransferDraftRequest
}

interface SubmitDraftVariables {
  transferId: string
  request: SubmitTransferRequest
}

interface UpdateTransferVariables {
  transferId: string
  request: UpdateTransferRequest
}

interface CancelTransferVariables {
  transferId: string
  request: CancelTransferRequest
}

interface AddFeedbackVariables {
  transferId: string
  request: AddTransferFeedbackRequest
}

interface ReplyFeedbackVariables {
  transferId: string
  feedbackId: string
  request: ReplyTransferFeedbackRequest
}

export function useSaveTransferDraftMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, SaveDraftVariables>({
    mutationFn: ({ transferId, request }) =>
      transferId
        ? transferService.updateDraft(transferId, request)
        : transferService.createDraft(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
    onError: (error) => logger.error(error),
  })
}

export function useSubmitTransferDraftMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, SubmitDraftVariables>({
    mutationFn: ({ transferId, request }) => transferService.submitDraft(transferId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useUpdateTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateTransferVariables>({
    mutationFn: ({ transferId, request }) => transferService.updateTransfer(transferId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useCancelTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, CancelTransferVariables>({
    mutationFn: ({ transferId, request }) => transferService.cancelTransfer(transferId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useStopTransferRemainingMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, CancelTransferVariables>({
    mutationFn: ({ transferId, request }) => transferService.stopRemaining(transferId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useAddTransferFeedbackMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, AddFeedbackVariables>({
    mutationFn: ({ transferId, request }) => transferService.addFeedback(transferId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
    onError: (error) => logger.error(error),
  })
}

export function useReplyTransferFeedbackMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, ReplyFeedbackVariables>({
    mutationFn: ({ transferId, feedbackId, request }) =>
      transferService.replyFeedback(transferId, feedbackId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
    onError: (error) => logger.error(error),
  })
}
