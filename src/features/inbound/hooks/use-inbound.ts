import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { inboundService } from '../services/inbound.service'
import type {
  InboundAllowedActionsResponse,
  InboundListQuery,
  InboundReceiptDetail,
  InboundReceiptListResponse,
  PutawayRequest,
  PutawayTaskQuery,
  ReceivingTaskListResponse,
  ReceivingTaskQuery,
  SaveInboundReceiptRequest,
} from '../types/inbound.types'

interface UpdateReceiptVariables {
  receiptId: string
  request: Omit<SaveInboundReceiptRequest, 'purchaseOrderId'>
}

interface RejectReceiptVariables {
  receiptId: string
  reason: string
}

interface PutawayVariables {
  receiptId: string
  request: PutawayRequest
}

export function useReceivingTasksQuery(params: ReceivingTaskQuery) {
  return useQuery<ReceivingTaskListResponse, ApiErrorResponse>({
    queryKey: queryKeys.inboundReceipts.receivingTasks(params),
    queryFn: () => inboundService.getReceivingTasks(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useInboundReceiptsQuery(params: InboundListQuery) {
  return useQuery<InboundReceiptListResponse, ApiErrorResponse>({
    queryKey: queryKeys.inboundReceipts.list(params),
    queryFn: () => inboundService.getReceipts(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function usePutawayTasksQuery(params: PutawayTaskQuery) {
  return useQuery<InboundReceiptListResponse, ApiErrorResponse>({
    queryKey: queryKeys.inboundReceipts.putawayTasks(params),
    queryFn: () => inboundService.getPutawayTasks(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useInboundReceiptQuery(receiptId: string) {
  return useQuery<InboundReceiptDetail, ApiErrorResponse>({
    queryKey: queryKeys.inboundReceipts.detail(receiptId),
    queryFn: () => inboundService.getReceipt(receiptId).then((response) => response.data),
    enabled: Boolean(receiptId),
  })
}

export function useInboundAllowedActionsQuery(receiptId: string) {
  return useQuery<InboundAllowedActionsResponse, ApiErrorResponse>({
    queryKey: queryKeys.inboundReceipts.allowedActions(receiptId),
    queryFn: () => inboundService.getAllowedActions(receiptId).then((response) => response.data),
    enabled: Boolean(receiptId),
  })
}

function useInvalidateInbound() {
  const queryClient = useQueryClient()
  return async (receiptId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.inboundReceipts.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      ...(receiptId
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.inboundReceipts.detail(receiptId),
            }),
          ]
        : []),
    ])
  }
}

export function useCreateInboundReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<string>, ApiErrorResponse, SaveInboundReceiptRequest>({
    mutationFn: inboundService.createReceipt,
    onSuccess: () => invalidate(),
    onError: (error) => logger.error(error),
  })
}

export function useUpdateInboundReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateReceiptVariables>({
    mutationFn: ({ receiptId, request }) => inboundService.updateReceipt(receiptId, request),
    onSuccess: (_, variables) => invalidate(variables.receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useSubmitInboundReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inboundService.submitReceipt,
    onSuccess: (_, receiptId) => invalidate(receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useApproveInboundReceiptMutation() {
  const invalidate = useInvalidateInbound()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: inboundService.approveReceipt,
    onSuccess: (_, receiptId) => invalidate(receiptId),
    onError: (error) => logger.error(error),
  })
}

export function useRejectInboundReceiptMutation() {
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
