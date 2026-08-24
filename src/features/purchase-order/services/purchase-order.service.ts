import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  AllowedActionsResponse,
  LookupListResponse,
  LookupQuery,
  PagedResponse,
  ProductOption,
  PurchaseOrderDetail,
  PurchaseOrderListQuery,
  PurchaseOrderSummary,
  SavePurchaseOrderRequest,
  SupplierOption,
} from '../types/purchase-order.types'

export const purchaseOrderService = {
  getPurchaseOrders: (params: PurchaseOrderListQuery) =>
    axiosClient
      .get<ApiResponse<PagedResponse<PurchaseOrderSummary>>>(API_ENDPOINTS.purchaseOrders.list, {
        params,
      })
      .then((response) => response.data),
  getPurchaseOrder: (purchaseOrderId: string) =>
    axiosClient
      .get<ApiResponse<PurchaseOrderDetail>>(API_ENDPOINTS.purchaseOrders.detail(purchaseOrderId))
      .then((response) => response.data),
  getAllowedActions: (purchaseOrderId: string) =>
    axiosClient
      .get<
        ApiResponse<AllowedActionsResponse>
      >(API_ENDPOINTS.purchaseOrders.allowedActions(purchaseOrderId))
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
  createPurchaseOrder: (request: SavePurchaseOrderRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.purchaseOrders.create, request)
      .then((response) => response.data),
  updatePurchaseOrder: (purchaseOrderId: string, request: SavePurchaseOrderRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.purchaseOrders.update(purchaseOrderId), request)
      .then((response) => response.data),
  submitPurchaseOrder: (purchaseOrderId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.purchaseOrders.submit(purchaseOrderId))
      .then((response) => response.data),
  approvePurchaseOrder: (purchaseOrderId: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.purchaseOrders.approve(purchaseOrderId))
      .then((response) => response.data),
  rejectPurchaseOrder: (purchaseOrderId: string, reason: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.purchaseOrders.reject(purchaseOrderId), { reason })
      .then((response) => response.data),
}
