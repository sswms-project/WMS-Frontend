import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LocationSearchResponse } from '@/features/warehouse/types/warehouse.types'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { transferService } from '../services/transfer.service'
import type {
  CancelTransferShipmentRequest,
  CreateTransferShipmentRequest,
  DispatchTransferShipmentRequest,
  EscalateTransferPickRequest,
  ReceiveTransferShipmentRequest,
  RecordTransferPickRequest,
  ResolveTransferDiscrepancyRequest,
  ResolveTransferEscalationRequest,
  ReturnTransferPickRequest,
  SwitchTransferPickRequest,
  TransferPickAlternative,
  TransferPickSheet,
  TransferReceiveSheet,
} from '../types/transfer.types'
import { invalidateTransferQueries } from './use-transfers'

interface ShipmentScope {
  transferId: string
  shipmentId: string
}

export function useTransferPickSheetQuery(transferId: string | null, shipmentId: string | null) {
  return useQuery<TransferPickSheet, ApiErrorResponse>({
    queryKey: queryKeys.transfers.pickSheet(transferId ?? '', shipmentId ?? ''),
    queryFn: () =>
      transferService
        .getPickSheet(transferId ?? '', shipmentId ?? '')
        .then((response) => response.data),
    enabled: Boolean(transferId && shipmentId),
  })
}

export function useTransferPickAlternativesQuery(
  transferId: string | null,
  shipmentId: string | null,
  lineId: string | null,
  enabled = true
) {
  return useQuery<TransferPickAlternative[], ApiErrorResponse>({
    queryKey: queryKeys.transfers.pickAlternatives(
      transferId ?? '',
      shipmentId ?? '',
      lineId ?? ''
    ),
    queryFn: () =>
      transferService
        .getPickAlternatives(transferId ?? '', shipmentId ?? '', lineId ?? '')
        .then((response) => response.data),
    enabled: enabled && Boolean(transferId && shipmentId && lineId),
  })
}

export function useTransferReceiveSheetQuery(transferId: string | null, shipmentId: string | null) {
  return useQuery<TransferReceiveSheet, ApiErrorResponse>({
    queryKey: queryKeys.transfers.receiveSheet(transferId ?? '', shipmentId ?? ''),
    queryFn: () =>
      transferService
        .getReceiveSheet(transferId ?? '', shipmentId ?? '')
        .then((response) => response.data),
    enabled: Boolean(transferId && shipmentId),
  })
}

/** Tra vị trí cất hàng theo mã quét; coi như một lệnh gọi theo yêu cầu, không phải dữ liệu cần cache. */
export function useFindReceivableSlotMutation() {
  return useMutation<
    LocationSearchResponse | null,
    ApiErrorResponse,
    { warehouseId: string; scannedCode: string }
  >({
    mutationFn: ({ warehouseId, scannedCode }) =>
      transferService.findReceivableSlot(warehouseId, scannedCode),
    onError: (error) => logger.error(error),
  })
}

export function useCreateTransferShipmentMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<string>,
    ApiErrorResponse,
    { transferId: string; request: CreateTransferShipmentRequest }
  >({
    mutationFn: ({ transferId, request }) => transferService.createShipment(transferId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useCancelTransferShipmentMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    ShipmentScope & { request: CancelTransferShipmentRequest }
  >({
    mutationFn: ({ transferId, shipmentId, request }) =>
      transferService.cancelShipment(transferId, shipmentId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useRecordTransferPickMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    ShipmentScope & { request: RecordTransferPickRequest }
  >({
    mutationFn: ({ transferId, shipmentId, request }) =>
      transferService.recordPick(transferId, shipmentId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useSwitchTransferPickMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    ShipmentScope & { lineId: string; request: SwitchTransferPickRequest }
  >({
    mutationFn: ({ transferId, shipmentId, lineId, request }) =>
      transferService.switchPick(transferId, shipmentId, lineId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useEscalateTransferPickMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<string>,
    ApiErrorResponse,
    ShipmentScope & { lineId: string; request: EscalateTransferPickRequest }
  >({
    mutationFn: ({ transferId, shipmentId, lineId, request }) =>
      transferService.escalatePick(transferId, shipmentId, lineId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useResolveTransferEscalationMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    ShipmentScope & {
      lineId: string
      exceptionId: string
      request: ResolveTransferEscalationRequest
    }
  >({
    mutationFn: ({ transferId, shipmentId, lineId, exceptionId, request }) =>
      transferService.resolveEscalation(transferId, shipmentId, lineId, exceptionId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useReturnTransferPickMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    ShipmentScope & { request: ReturnTransferPickRequest }
  >({
    mutationFn: ({ transferId, shipmentId, request }) =>
      transferService.returnPick(transferId, shipmentId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useDispatchTransferShipmentMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    ShipmentScope & { request: DispatchTransferShipmentRequest }
  >({
    mutationFn: ({ transferId, shipmentId, request }) =>
      transferService.dispatchShipment(transferId, shipmentId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useReceiveTransferShipmentMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    ShipmentScope & { request: ReceiveTransferShipmentRequest }
  >({
    mutationFn: ({ transferId, shipmentId, request }) =>
      transferService.receiveShipment(transferId, shipmentId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}

export function useResolveTransferDiscrepancyMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<unknown>,
    ApiErrorResponse,
    { transferId: string; discrepancyId: string; request: ResolveTransferDiscrepancyRequest }
  >({
    mutationFn: ({ transferId, discrepancyId, request }) =>
      transferService.resolveDiscrepancy(transferId, discrepancyId, request),
    onSuccess: () => invalidateTransferQueries(queryClient),
    onError: (error) => logger.error(error),
  })
}
