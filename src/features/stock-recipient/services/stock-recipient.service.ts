import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CreateStockRecipientRequest,
  StockRecipient,
  StockRecipientListQuery,
  StockRecipientListResponse,
  StockRecipientIssueHistoryQuery,
  StockRecipientIssueHistoryResponse,
  UpdateStockRecipientRequest,
} from '../types/stock-recipient.types'

export const stockRecipientService = {
  getStockRecipients: (params: StockRecipientListQuery) =>
    axiosClient
      .get<ApiResponse<StockRecipientListResponse>>(API_ENDPOINTS.stockRecipients.list, { params })
      .then((response) => response.data),

  getStockRecipient: (stockRecipientId: string) =>
    axiosClient
      .get<ApiResponse<StockRecipient>>(API_ENDPOINTS.stockRecipients.detail(stockRecipientId))
      .then((response) => response.data),

  getIssueHistory: (stockRecipientId: string, params: StockRecipientIssueHistoryQuery) =>
    axiosClient
      .get<
        ApiResponse<StockRecipientIssueHistoryResponse>
      >(API_ENDPOINTS.stockRecipients.issueHistory(stockRecipientId), { params })
      .then((response) => response.data),

  createStockRecipient: (request: CreateStockRecipientRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.stockRecipients.create, request)
      .then((response) => response.data),

  updateStockRecipient: (stockRecipientId: string, request: UpdateStockRecipientRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.stockRecipients.update(stockRecipientId), request)
      .then((response) => response.data),

  changeStatus: (stockRecipientId: string, status: 'Active' | 'Inactive') =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(status === 'Active' ? API_ENDPOINTS.stockRecipients.reactivate(stockRecipientId) : API_ENDPOINTS.stockRecipients.deactivate(stockRecipientId))
      .then((response) => response.data),
}
