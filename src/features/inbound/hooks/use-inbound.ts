import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { inboundService } from '../services/inbound.service'
import type {
  InboundAllowedActionsResponse,
  InboundDocumentImport,
  InboundListQuery,
  GoodsReceiptDetail,
  GoodsReceiptListResponse,
  PutawayRequest,
  PutawayTaskQuery,
  ReceivingTaskListResponse,
  ReceivingTaskQuery,
  SaveGoodsReceiptRequest,
  StartInboundDocumentImportRequest,
  ReviewInboundDocumentImportRequest,
  CancelPutawayTaskRequest,
  ReconcilePutawayCancellationRequest,
} from '../types/inbound.types'

interface UpdateReceiptVariables {
  receiptId: string
  request: Omit<SaveGoodsReceiptRequest, 'inboundRequestId'>
}

interface RejectReceiptVariables {
  receiptId: string
  reason: string
}

interface PutawayVariables {
  receiptId: string
  request: PutawayRequest
}

interface CancelPutawayTaskVariables {
  receiptId: string
  request: CancelPutawayTaskRequest
}

interface ReconcilePutawayCancellationVariables {
  receiptId: string
  request: ReconcilePutawayCancellationRequest
}

export function useReceivingTasksQuery(params: ReceivingTaskQuery) {
  return useQuery<ReceivingTaskListResponse, ApiErrorResponse>({
    queryKey: queryKeys.goodsReceipts.receivingTasks(params),
    queryFn: () => inboundService.getReceivingTasks(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useGoodsReceiptsQuery(params: InboundListQuery) {
  return useQuery<GoodsReceiptListResponse, ApiErrorResponse>({
    queryKey: queryKeys.goodsReceipts.list(params),
    queryFn: () => inboundService.getReceipts(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function usePutawayTasksQuery(params: PutawayTaskQuery) {
  return useQuery<GoodsReceiptListResponse, ApiErrorResponse>({
    queryKey: queryKeys.goodsReceipts.putawayTasks(params),
    queryFn: () => inboundService.getPutawayTasks(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useGoodsReceiptQuery(receiptId: string) {
  return useQuery<GoodsReceiptDetail, ApiErrorResponse>({
    queryKey: queryKeys.goodsReceipts.detail(receiptId),
    queryFn: () => inboundService.getReceipt(receiptId).then((response) => response.data),
    enabled: Boolean(receiptId),
  })
}

export function useInboundDocumentImportQuery(importId: string) {
  return useQuery<InboundDocumentImport, ApiErrorResponse>({
    queryKey: queryKeys.inboundDocumentImports.detail(importId),
    queryFn: () => inboundService.getDocumentImport(importId).then((response) => response.data),
    enabled: Boolean(importId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'Pending' ||
        status === 'Uploaded' ||
        status === 'Scanning' ||
        status === 'Processing'
        ? 1_500
        : false
    },
  })
}

export function useInboundAllowedActionsQuery(receiptId: string) {
  return useQuery<InboundAllowedActionsResponse, ApiErrorResponse>({
    queryKey: queryKeys.goodsReceipts.allowedActions(receiptId),
    queryFn: () => inboundService.getAllowedActions(receiptId).then((response) => response.data),
    enabled: Boolean(receiptId),
  })
}

function useInvalidateInbound() {
  const queryClient = useQueryClient()
  return async (receiptId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceipts.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inboundRequests.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      ...(receiptId
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.goodsReceipts.detail(receiptId),
            }),
          ]
        : []),
    ])
  }
}

export function useCreateGoodsReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<string>, ApiErrorResponse, SaveGoodsReceiptRequest>({
    mutationFn: inboundService.createReceipt,
    onSuccess: () => invalidate(),
    onError: (error) => logger.error(error),
  })
}

export function useStartInboundDocumentImportMutation() {
  return useMutation<ApiResponse<string>, ApiErrorResponse, StartInboundDocumentImportRequest>({
    mutationFn: inboundService.startDocumentImport,
    onError: (error) => logger.error(error),
  })
}

export function useReviewInboundDocumentImportMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, ReviewInboundDocumentImportRequest>({
    mutationFn: inboundService.reviewDocumentImport,
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.inboundDocumentImports.detail(variables.id),
      }),
    onError: (error) => logger.error(error),
  })
}

export function useCreateDraftFromDocumentMutation() {
  const invalidateInbound = useInvalidateInbound()
  return useMutation<ApiResponse<string>, ApiErrorResponse, string>({
    mutationFn: inboundService.createDraftFromDocument,
    onSuccess: () => invalidateInbound(),
    onError: (error) => logger.error(error),
  })
}

export function useUpdateGoodsReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateReceiptVariables>({
    mutationFn: ({ receiptId, request }) => inboundService.updateReceipt(receiptId, request),
    onSuccess: (_, variables) => invalidate(variables.receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useSubmitGoodsReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inboundService.submitReceipt,
    onSuccess: (_, receiptId) => invalidate(receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useApproveGoodsReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inboundService.approveReceipt,
    onSuccess: (_, receiptId) => invalidate(receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useRejectGoodsReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, RejectReceiptVariables>({
    mutationFn: ({ receiptId, reason }) => inboundService.rejectReceipt(receiptId, reason),
    onSuccess: (_, variables) => invalidate(variables.receiptId),
    onError: (error) => logger.error(error),
  })
}

export function usePutawayMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, PutawayVariables>({
    mutationFn: ({ receiptId, request }) => inboundService.putaway(receiptId, request),
    onSuccess: (_, variables) => invalidate(variables.receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useCancelPutawayTaskMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, CancelPutawayTaskVariables>({
    mutationFn: ({ receiptId, request }) => inboundService.cancelPutawayTask(receiptId, request),
    onSuccess: (_, variables) => invalidate(variables.receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useReconcilePutawayCancellationMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, ReconcilePutawayCancellationVariables>(
    {
      mutationFn: ({ receiptId, request }) =>
        inboundService.reconcilePutawayCancellation(receiptId, request),
      onSuccess: (_, variables) => invalidate(variables.receiptId),
      onError: (error) => logger.error(error),
    }
  )
}
