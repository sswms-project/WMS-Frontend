import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CategoryResponse,
  ConfigureStockPolicyRequest,
  CreateProductRequest,
  ImportProductsRequest,
  ProductListQuery,
  ProductListResponse,
  ProductLot,
  ProductLotImpact,
  ProductLotQuery,
  ProductResponse,
  ProductSupplier,
  ProductWarehousePolicy,
  SaveProductSupplierRequest,
  UnitResponse,
  UpdateProductSupplierRequest,
  UpdateProductRequest,
} from '../types/product.types'

export const productService = {
  getUnits: () =>
    axiosClient.get<ApiResponse<UnitResponse[]>>(API_ENDPOINTS.units.list).then((r) => r.data),

  getCategories: () =>
    axiosClient
      .get<ApiResponse<CategoryResponse[]>>(API_ENDPOINTS.categories.list)
      .then((r) => r.data),

  getProducts: (params?: ProductListQuery) =>
    axiosClient
      .get<ApiResponse<ProductListResponse>>(API_ENDPOINTS.products.list, { params })
      .then((r) => r.data),

  getProductById: (id: string) =>
    axiosClient
      .get<ApiResponse<ProductResponse>>(API_ENDPOINTS.products.detail(id))
      .then((r) => r.data),

  createProduct: (request: CreateProductRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.products.create, request)
      .then((r) => r.data),

  updateProduct: (id: string, request: UpdateProductRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.products.update(id), request)
      .then((r) => r.data),

  configureStockPolicy: (id: string, request: ConfigureStockPolicyRequest) =>
    axiosClient
      .patch<ApiResponse<unknown>>(API_ENDPOINTS.products.stockPolicy(id), request)
      .then((r) => r.data),

  getStockPolicies: (id: string) =>
    axiosClient
      .get<ApiResponse<ProductWarehousePolicy[]>>(API_ENDPOINTS.products.stockPolicies(id))
      .then((r) => r.data),

  getProductLots: (id: string, params: ProductLotQuery) =>
    axiosClient
      .get<ApiResponse<ProductLot[]>>(API_ENDPOINTS.products.lots(id), { params })
      .then((r) => r.data),

  getProductLotImpact: (productId: string, lotId: string) =>
    axiosClient
      .get<ApiResponse<ProductLotImpact>>(API_ENDPOINTS.products.lotImpact(productId, lotId))
      .then((r) => r.data),

  blockProductLot: (productId: string, lotId: string, reason: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.products.blockLot(productId, lotId), { reason })
      .then((r) => r.data),

  unlockProductLot: (productId: string, lotId: string, reason: string) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.products.unlockLot(productId, lotId), { reason })
      .then((r) => r.data),

  generateBarcode: (id: string) =>
    axiosClient.post<ApiResponse<unknown>>(API_ENDPOINTS.products.barcode(id)).then((r) => r.data),

  importProducts: (request: ImportProductsRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.products.import, request)
      .then((r) => r.data),

  getProductSuppliers: (id: string) =>
    axiosClient
      .get<ApiResponse<ProductSupplier[]>>(API_ENDPOINTS.products.suppliers(id))
      .then((r) => r.data),

  addProductSupplier: (id: string, request: SaveProductSupplierRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.products.suppliers(id), request)
      .then((r) => r.data),

  updateProductSupplier: (
    productId: string,
    linkId: string,
    request: UpdateProductSupplierRequest
  ) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.products.supplier(productId, linkId), request)
      .then((r) => r.data),

  deleteProductSupplier: (productId: string, linkId: string) =>
    axiosClient
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.products.supplier(productId, linkId))
      .then((r) => r.data),
}
