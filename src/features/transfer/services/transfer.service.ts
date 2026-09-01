import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type { QueryResult } from '@/types/api'
import type { WarehouseResponse } from '@/types/warehouse'
import type { InventoryBalanceListResponse } from '@/features/inventory/types/inventory.types'
import type {
  ApproveTransferRequest,
  CreateTransferRequest,
  ReceiveTransferRequest,
  RejectTransferRequest,
  TransferListQuery,
  TransferListResponse,
  TransferSourceInventoryQuery,
  TransferSourceWarehouseQuery,
  TransferSummary,
} from '../types/transfer.types'

export const transferService = {
  getTransfers: (params: TransferListQuery) =>
    axiosClient
      .get<ApiResponse<TransferListResponse>>(API_ENDPOINTS.transfers.list, { params })
      .then((response) => response.data),

  getTransfer: (transferId: string) =>
    axiosClient
      .get<ApiResponse<TransferSummary>>(API_ENDPOINTS.transfers.detail(transferId))
      .then((response) => response.data),

  getSourceWarehouses: (params: TransferSourceWarehouseQuery) =>
    axiosClient
      .get<ApiResponse<QueryResult<WarehouseResponse>>>(API_ENDPOINTS.transfers.sourceWarehouses, {
        params,
      })
      .then((response) => response.data),

  getSourceInventory: (params: TransferSourceInventoryQuery) =>
    axiosClient
      .get<ApiResponse<InventoryBalanceListResponse>>(API_ENDPOINTS.transfers.sourceInventory, {
        params,
      })
      .then((response) => response.data),

  createTransfer: (request: CreateTransferRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.transfers.create, request)
      .then((response) => response.data),

  approveTransfer: (transferId: string, request?: ApproveTransferRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.approve(transferId), request)
      .then((response) => response.data),

  rejectTransfer: (transferId: string, request: RejectTransferRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.reject(transferId), request)
      .then((response) => response.data),

  dispatchTransfer: (transferId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.dispatch(transferId))
      .then((response) => response.data),

  receiveTransfer: (transferId: string, request?: ReceiveTransferRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.receive(transferId), request)
      .then((response) => response.data),
}
