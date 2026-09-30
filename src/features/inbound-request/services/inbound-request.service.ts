import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  AllowedActionsResponse,
  LookupListResponse,
  LookupQuery,
  InboundRequestListResponse,
  ProductOption,
  InboundRequestDetail,
  InboundRequestListQuery,
  SaveInboundRequestRequest,
  SupplierOption,
} from '../types/inbound-request.types'

export const inboundRequestService = {
  getInboundRequests: (params: InboundRequestListQuery) =>
    axiosClient
      .get<ApiResponse<InboundRequestListResponse>>(API_ENDPOINTS.inboundRequests.list, {
        params,
      })
      .then((response) => response.data),
  getInboundRequest: (inboundRequestId: string) =>
    axiosClient
      .get<
        ApiResponse<InboundRequestDetail>
      >(API_ENDPOINTS.inboundRequests.detail(inboundRequestId))
      .then((response) => response.data),
  getAllowedActions: (inboundRequestId: string) =>
    axiosClient
      .get<
        ApiResponse<AllowedActionsResponse>
      >(API_ENDPOINTS.inboundRequests.allowedActions(inboundRequestId))
      .then((response) => response.data),
  getProducts: (params: LookupQuery) =>
    axiosClient
      .get<ApiResponse<LookupListResponse<ProductOption>>>(API_ENDPOINTS.products.list, { params })
      .then((response) => response.data),
  getSuppliers: (params: LookupQuery) =>
    axiosClient
      .get<
        ApiResponse<LookupListResponse<SupplierOption>>
      >(API_ENDPOINTS.suppliers.list, { params })
      .then((response) => response.data),
  createInboundRequest: (request: SaveInboundRequestRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inboundRequests.create, request)
      .then((response) => response.data),
  duplicateInboundRequest: (inboundRequestId: string) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.inboundRequests.duplicate(inboundRequestId))
      .then((response) => response.data),
  updateInboundRequest: (inboundRequestId: string, request: SaveInboundRequestRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.inboundRequests.update(inboundRequestId), request)
      .then((response) => response.data),
  deleteInboundRequest: (inboundRequestId: string) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.inboundRequests.delete(inboundRequestId))
      .then((response) => response.data),
  deleteInboundRequests: (ids: readonly string[]) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.inboundRequests.deleteMany, { data: { ids } })
      .then((response) => response.data),
  submitInboundRequest: (inboundRequestId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundRequests.submit(inboundRequestId))
      .then((response) => response.data),
  submitInboundRequests: (ids: readonly string[]) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundRequests.submitMany, { ids })
      .then((response) => response.data),
  approveInboundRequest: (inboundRequestId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundRequests.approve(inboundRequestId))
      .then((response) => response.data),
  approveInboundRequests: (ids: readonly string[]) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.inboundRequests.approveMany, { ids })
      .then((response) => response.data),
  rejectInboundRequest: (inboundRequestId: string, reason: string) =>
    axiosClient
      .post<
        ApiResponse<unknown>
      >(API_ENDPOINTS.inboundRequests.reject(inboundRequestId), { reason })
      .then((response) => response.data),
}
