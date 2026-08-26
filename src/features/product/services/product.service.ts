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
  ProductResponse,
  UnitResponse,
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

  generateBarcode: (id: string) =>
    axiosClient.post<ApiResponse<unknown>>(API_ENDPOINTS.products.barcode(id)).then((r) => r.data),

  importProducts: (request: ImportProductsRequest) =>
    axiosClient
      .post<ApiResponse<unknown>>(API_ENDPOINTS.products.import, request)
      .then((r) => r.data),
}
