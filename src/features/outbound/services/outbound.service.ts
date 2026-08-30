import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CreateOutboundOrderRequest,
  CustomerListQuery,
  CustomerListResponse,
  IssueStockRequest,
  OutboundOrderListQuery,
  OutboundOrderListResponse,
  RecordReturnRequest,
  ReturnListQuery,
  ReturnListResponse,
} from '../types/outbound.types'

export const outboundService = {
  getOutboundOrders: (params: OutboundOrderListQuery) =>
    axiosClient
      .get<ApiResponse<OutboundOrderListResponse>>(API_ENDPOINTS.outboundOrders.list, { params })
      .then((response) => response.data),

  createOutboundOrder: (request: CreateOutboundOrderRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.outboundOrders.create, request)
      .then((response) => response.data),

  issueStock: (outboundOrderId: string, request: IssueStockRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.outboundOrders.issue(outboundOrderId), request)
      .then((response) => response.data),

  recordReturn: (outboundOrderId: string, request: RecordReturnRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.outboundOrders.returns(outboundOrderId), request)
      .then((response) => response.data),

  getReturns: (params: ReturnListQuery) =>
    axiosClient
      .get<ApiResponse<ReturnListResponse>>(API_ENDPOINTS.returns.list, { params })
      .then((response) => response.data),

  approveReturn: (returnId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.returns.approve(returnId))
      .then((response) => response.data),

  getCustomers: (params: CustomerListQuery) =>
    axiosClient
      .get<ApiResponse<CustomerListResponse>>(API_ENDPOINTS.customers.list, { params })
      .then((response) => response.data),
}
