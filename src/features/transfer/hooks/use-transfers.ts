import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import type { QueryResult } from '@/types/api'
import type { WarehouseResponse } from '@/types/warehouse'
import type { InventoryBalanceListResponse } from '@/features/inventory/types/inventory.types'
import { transferService } from '../services/transfer.service'
import type {
  CreateTransferRequest,
  ApproveTransferRequest,
  ReceiveTransferRequest,
  RejectTransferRequest,
  TransferListQuery,
  TransferListResponse,
  TransferSummary,
  TransferSourceInventoryQuery,
  TransferSourceWarehouseQuery,
} from '../types/transfer.types'

interface RejectTransferVariables {
  transferId: string
  request: RejectTransferRequest
}

interface ApproveTransferVariables {
  transferId: string
  request: ApproveTransferRequest
}

interface ReceiveTransferVariables {
  transferId: string
  request: ReceiveTransferRequest
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
  return useQuery<TransferSummary, ApiErrorResponse>({
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

export function useTransferSourceInventoryQuery(
  params: TransferSourceInventoryQuery,
  enabled = true
) {
  return useQuery<InventoryBalanceListResponse, ApiErrorResponse>({
    queryKey: queryKeys.transfers.sourceInventory(params),
    queryFn: () => transferService.getSourceInventory(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useCreateTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateTransferRequest>({
    mutationFn: transferService.createTransfer,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      ]),
    onError: (error) => logger.error(error),
  })
}

export function useApproveTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, ApproveTransferVariables>({
    mutationFn: ({ transferId, request }) => transferService.approveTransfer(transferId, request),
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
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, ReceiveTransferVariables>({
    mutationFn: ({ transferId, request }) => transferService.receiveTransfer(transferId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
    onError: (error) => logger.error(error),
  })
}
