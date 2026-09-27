import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CreateStockIssueRequestRequest,
  RecordStockPickingRequest,
  StockIssueRequestListQuery,
  StockIssueRequestListResponse,
  StockIssueRequestSummary,
  CreateGoodsReturnRequestRequest,
  RejectGoodsReturnRequestRequest,
  GoodsReturnRequestListQuery,
  GoodsReturnRequestListResponse,
  GoodsReturnRequestSummary,
  ReleaseStockIssueRequestRequest,
} from '../types/stock-issue.types'

export const stockIssueService = {
  getStockIssueRequests: (params: StockIssueRequestListQuery) =>
    axiosClient
      .get<
        ApiResponse<StockIssueRequestListResponse>
      >(API_ENDPOINTS.stockIssueRequests.list, { params })
      .then((response) => response.data),

  getStockIssueRequest: (stockIssueRequestId: string) =>
    axiosClient
      .get<
        ApiResponse<StockIssueRequestSummary>
      >(API_ENDPOINTS.stockIssueRequests.detail(stockIssueRequestId))
      .then((response) => response.data),

  createStockIssueRequest: (request: CreateStockIssueRequestRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.stockIssueRequests.create, request)
      .then((response) => response.data),

  releaseForPicking: (request: ReleaseStockIssueRequestRequest) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.stockIssueRequests.releaseForPicking(request.stockIssueRequestId), request)
      .then((response) => response.data),

  recordStockPicking: (stockIssueRequestId: string, request: RecordStockPickingRequest) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.stockIssueRequests.picks(stockIssueRequestId), request)
      .then((response) => response.data),

  confirmDispatch: (stockIssueRequestId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.stockIssueRequests.dispatch(stockIssueRequestId))
      .then((response) => response.data),

  authorizeDispatch: (stockIssueRequestId: string) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.stockIssueRequests.authorizeDispatch(stockIssueRequestId))
      .then((response) => response.data),

  removePickDetail: (stockIssueRequestId: string, pickDetailId: string) =>
    axiosClient
      .delete<
        ApiResponse<unknown>
      >(API_ENDPOINTS.stockIssueRequests.removePickDetail(stockIssueRequestId, pickDetailId))
      .then((response) => response.data),

  createGoodsReturnRequest: (
    stockIssueRequestId: string,
    request: CreateGoodsReturnRequestRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<string>
      >(API_ENDPOINTS.stockIssueRequests.goodsReturnRequests(stockIssueRequestId), request)
      .then((response) => response.data),

  getGoodsReturnRequests: (params: GoodsReturnRequestListQuery) =>
    axiosClient
      .get<
        ApiResponse<GoodsReturnRequestListResponse>
      >(API_ENDPOINTS.goodsReturnRequests.list, { params })
      .then((response) => response.data),

  getGoodsReturnRequest: (goodsReturnRequestId: string) =>
    axiosClient
      .get<
        ApiResponse<GoodsReturnRequestSummary>
      >(API_ENDPOINTS.goodsReturnRequests.detail(goodsReturnRequestId))
      .then((response) => response.data),

  approveGoodsReturnRequest: (goodsReturnRequestId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.goodsReturnRequests.approve(goodsReturnRequestId))
      .then((response) => response.data),

  rejectGoodsReturnRequest: (
    goodsReturnRequestId: string,
    request: RejectGoodsReturnRequestRequest
  ) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.goodsReturnRequests.reject(goodsReturnRequestId), request)
      .then((response) => response.data),
}
