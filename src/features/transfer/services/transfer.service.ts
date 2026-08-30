import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CreateTransferRequest,
  RejectTransferRequest,
  TransferListQuery,
  TransferListResponse,
} from '../types/transfer.types'

export const transferService = {
  getTransfers: (params: TransferListQuery) =>
    axiosClient
      .get<ApiResponse<TransferListResponse>>(API_ENDPOINTS.transfers.list, { params })
      .then((response) => response.data),

  createTransfer: (request: CreateTransferRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.transfers.create, request)
      .then((response) => response.data),

  approveTransfer: (transferId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.approve(transferId))
      .then((response) => response.data),

  rejectTransfer: (transferId: string, request: RejectTransferRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.reject(transferId), request)
      .then((response) => response.data),

  dispatchTransfer: (transferId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.dispatch(transferId))
      .then((response) => response.data),

  receiveTransfer: (transferId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.transfers.receive(transferId))
      .then((response) => response.data),
}
