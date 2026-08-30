import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { transferService } from '../services/transfer.service'
import type {
  CreateTransferRequest,
  RejectTransferRequest,
  TransferListQuery,
  TransferListResponse,
} from '../types/transfer.types'

interface RejectTransferVariables {
  transferId: string
  request: RejectTransferRequest
}

export function useTransfersQuery(params: TransferListQuery, enabled = true) {
  return useQuery<TransferListResponse, ApiErrorResponse>({
    queryKey: queryKeys.transfers.list(params),
    queryFn: () => transferService.getTransfers(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useCreateTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateTransferRequest>({
    mutationFn: transferService.createTransfer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
    onError: (error) => logger.error(error),
  })
}

export function useApproveTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: transferService.approveTransfer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
    onError: (error) => logger.error(error),
  })
}

export function useRejectTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, RejectTransferVariables>({
    mutationFn: ({ transferId, request }) => transferService.rejectTransfer(transferId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
    onError: (error) => logger.error(error),
  })
}

export function useDispatchTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: transferService.dispatchTransfer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
    onError: (error) => logger.error(error),
  })
}

export function useReceiveTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, string>({
    mutationFn: transferService.receiveTransfer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
    onError: (error) => logger.error(error),
  })
}
