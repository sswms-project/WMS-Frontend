import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  SaveSupplierRequest,
  Supplier,
  SupplierListQuery,
  SupplierListResponse,
} from '../types/supplier.types'

export const supplierService = {
  getSuppliers: (params: SupplierListQuery) =>
    axiosClient
      .get<ApiResponse<SupplierListResponse>>(API_ENDPOINTS.suppliers.list, { params })
      .then((response) => response.data),

  getSupplier: (supplierId: string) =>
    axiosClient
      .get<ApiResponse<Supplier>>(API_ENDPOINTS.suppliers.detail(supplierId))
      .then((response) => response.data),

  createSupplier: (request: SaveSupplierRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.suppliers.create, request)
      .then((response) => response.data),

  updateSupplier: (supplierId: string, request: SaveSupplierRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.suppliers.update(supplierId), request)
      .then((response) => response.data),

  // BE tra ve 204 No Content nen khong co body ApiResponse.
  deactivateSupplier: (supplierId: string) =>
    axiosClient.patch<void>(API_ENDPOINTS.suppliers.deactivate(supplierId)).then(() => undefined),

  reactivateSupplier: (supplierId: string) =>
    axiosClient.patch<void>(API_ENDPOINTS.suppliers.reactivate(supplierId)).then(() => undefined),
}
