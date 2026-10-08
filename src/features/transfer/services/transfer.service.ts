import { warehouseService } from '@/features/warehouse/services/warehouse.service'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse, QueryResult } from '@/types/api'
import type { WarehouseResponse } from '@/types/warehouse'
import type {
  AddTransferFeedbackRequest,
  CancelTransferRequest,
  CancelTransferShipmentRequest,
  CreateTransferShipmentRequest,
  DispatchTransferShipmentRequest,
  EscalateTransferPickRequest,
  ReceiveTransferShipmentRequest,
  RecordTransferPickRequest,
  ReplyTransferFeedbackRequest,
  ResolveTransferDiscrepancyRequest,
  ResolveTransferEscalationRequest,
  ReturnTransferPickRequest,
  SaveTransferDraftRequest,
  SubmitTransferRequest,
  SwitchTransferPickRequest,
  TransferAvailability,
  TransferAvailabilityQuery,
  TransferDetail,
  TransferListQuery,
  TransferListResponse,
  TransferPickAlternative,
  TransferPickSheet,
  TransferReceiveSheet,
  TransferSourceWarehouseQuery,
  UpdateTransferRequest,
} from '../types/transfer.types'
import { findRackLevelSlot, findReceivableSlot } from '../utils/transfer-receive'

const unwrap = <TData>(response: { data: ApiResponse<TData> }) => response.data

export const transferService = {
  /** Tra vị trí cất hàng hợp lệ của kho theo mã vừa quét; null nếu không có vị trí khớp. */
  findReceivableSlot: async (warehouseId: string, scannedCode: string) => {
    const response = await warehouseService.getLocations(warehouseId, {
      top: 20,
      skip: 0,
      needTotalCount: true,
      type: 'Slot',
      lifecycleStatus: 'Active',
      searchText: scannedCode.trim(),
    })
    const slot = findReceivableSlot(scannedCode, response.data.items)
    if (slot) return slot
    // Không phải ô con: thử mã kệ của kệ quản lý ở mức kệ.
    const layout = await warehouseService.getLayout(warehouseId)
    return findRackLevelSlot(scannedCode, layout.data)
  },

  getTransfers: (params: TransferListQuery) =>
    axiosClient
      .get<ApiResponse<TransferListResponse>>(API_ENDPOINTS.transfers.list, { params })
      .then(unwrap),

  getTransfer: (transferId: string) =>
    axiosClient
      .get<ApiResponse<TransferDetail>>(API_ENDPOINTS.transfers.detail(transferId))
      .then(unwrap),

  getSourceWarehouses: (params: TransferSourceWarehouseQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<WarehouseResponse>>>(API_ENDPOINTS.transfers.sourceWarehouses, {
        params,
      })
      .then(unwrap),

  getAvailability: (query: TransferAvailabilityQuery) =>
    axiosClient
      .post<ApiResponse<TransferAvailability[]>>(API_ENDPOINTS.transfers.availability, query)
      .then(unwrap),

  createDraft: (request: SaveTransferDraftRequest) =>
    axiosClient.post<ApiResponse<string>>(API_ENDPOINTS.transfers.drafts, request).then(unwrap),

  updateDraft: (transferId: string, request: SaveTransferDraftRequest) =>
    axiosClient
      .put<ApiResponse<string>>(API_ENDPOINTS.transfers.draft(transferId), request)
      .then(unwrap),

  submitDraft: (transferId: string, request: SubmitTransferRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.submitDraft(transferId), request)
      .then(unwrap),

  updateTransfer: (transferId: string, request: UpdateTransferRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.transfers.update(transferId), request)
      .then(unwrap),

  cancelTransfer: (transferId: string, request: CancelTransferRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.cancel(transferId), request)
      .then(unwrap),

  stopRemaining: (transferId: string, request: CancelTransferRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.stopRemaining(transferId), request)
      .then(unwrap),

  addFeedback: (transferId: string, request: AddTransferFeedbackRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.transfers.feedback(transferId), request)
      .then(unwrap),

  replyFeedback: (transferId: string, feedbackId: string, request: ReplyTransferFeedbackRequest) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.transfers.replyFeedback(transferId, feedbackId), request)
      .then(unwrap),

  createShipment: (transferId: string, request: CreateTransferShipmentRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.transfers.shipments(transferId), request)
      .then(unwrap),

  cancelShipment: (
    transferId: string,
    shipmentId: string,
    request: CancelTransferShipmentRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.transfers.cancelShipment(transferId, shipmentId), request)
      .then(unwrap),

  getPickSheet: (transferId: string, shipmentId: string) =>
    axiosClient
      .get<
        ApiResponse<TransferPickSheet>
      >(API_ENDPOINTS.transfers.pickSheet(transferId, shipmentId))
      .then(unwrap),

  getPickAlternatives: (transferId: string, shipmentId: string, lineId: string) =>
    axiosClient
      .get<
        ApiResponse<TransferPickAlternative[]>
      >(API_ENDPOINTS.transfers.pickAlternatives(transferId, shipmentId, lineId))
      .then(unwrap),

  recordPick: (transferId: string, shipmentId: string, request: RecordTransferPickRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.picks(transferId, shipmentId), request)
      .then(unwrap),

  switchPick: (
    transferId: string,
    shipmentId: string,
    lineId: string,
    request: SwitchTransferPickRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.transfers.switchPick(transferId, shipmentId, lineId), request)
      .then(unwrap),

  escalatePick: (
    transferId: string,
    shipmentId: string,
    lineId: string,
    request: EscalateTransferPickRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<string>
      >(API_ENDPOINTS.transfers.escalatePick(transferId, shipmentId, lineId), request)
      .then(unwrap),

  resolveEscalation: (
    transferId: string,
    shipmentId: string,
    lineId: string,
    exceptionId: string,
    request: ResolveTransferEscalationRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.transfers.resolveEscalation(transferId, shipmentId, lineId, exceptionId), request)
      .then(unwrap),

  returnPick: (transferId: string, shipmentId: string, request: ReturnTransferPickRequest) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.transfers.returnPick(transferId, shipmentId), request)
      .then(unwrap),

  dispatchShipment: (
    transferId: string,
    shipmentId: string,
    request: DispatchTransferShipmentRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.transfers.dispatchShipment(transferId, shipmentId), request)
      .then(unwrap),

  getReceiveSheet: (transferId: string, shipmentId: string) =>
    axiosClient
      .get<
        ApiResponse<TransferReceiveSheet>
      >(API_ENDPOINTS.transfers.receiveSheet(transferId, shipmentId))
      .then(unwrap),

  receiveShipment: (
    transferId: string,
    shipmentId: string,
    request: ReceiveTransferShipmentRequest
  ) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.receipt(transferId, shipmentId), request)
      .then(unwrap),

  resolveDiscrepancy: (
    transferId: string,
    discrepancyId: string,
    request: ResolveTransferDiscrepancyRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.transfers.resolveDiscrepancy(transferId, discrepancyId), request)
      .then(unwrap),
}
