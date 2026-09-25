import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CategoryResponse,
  ConfigureStockPolicyRequest,
  CreateProductUnitConversionRequest,
  CreateProductWithConversionsRequest,
  ImportProductsRequest,
  ProductListQuery,
  ProductListResponse,
  ProductLot,
  ProductLotQuery,
  ProductResponse,
  ProductSupplier,
  ProductUnitConversion,
  ProductWarehousePolicy,
  SaveCategoryRequest,
  SaveProductSupplierRequest,
  SaveUnitRequest,
  UnitResponse,
  UpdateProductSupplierRequest,
  UpdateProductUnitConversionRequest,
  UpdateProductRequest,
} from '../types/product.types'

export const productService = {
  getUnits: (status?: 'Active' | 'Inactive') =>
    axiosClient
      .get<ApiResponse<UnitResponse[]>>(API_ENDPOINTS.units.list, { params: { status } })
      .then((r) => r.data),

  createUnit: (request: SaveUnitRequest) =>
    axiosClient.post<ApiResponse<string>>(API_ENDPOINTS.units.create, request).then((r) => r.data),

  updateUnit: (id: string, request: SaveUnitRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.units.update(id), request)
      .then((r) => r.data),

  changeUnitStatus: (id: string, status: 'Active' | 'Inactive') =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(status === 'Active' ? API_ENDPOINTS.units.reactivate(id) : API_ENDPOINTS.units.deactivate(id))
      .then((r) => r.data),

  getCategories: (status?: 'Active' | 'Inactive') =>
    axiosClient
      .get<ApiResponse<CategoryResponse[]>>(API_ENDPOINTS.categories.list, { params: { status } })
      .then((r) => r.data),

  createCategory: (request: SaveCategoryRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.categories.create, request)
      .then((r) => r.data),

  updateCategory: (id: string, request: SaveCategoryRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.categories.update(id), request)
      .then((r) => r.data),

  changeCategoryStatus: (id: string, status: 'Active' | 'Inactive') =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(status === 'Active' ? API_ENDPOINTS.categories.reactivate(id) : API_ENDPOINTS.categories.deactivate(id))
      .then((r) => r.data),

  getProducts: (params?: ProductListQuery) =>
    axiosClient
      .get<ApiResponse<ProductListResponse>>(API_ENDPOINTS.products.list, { params })
      .then((r) => r.data),

  getProductById: (id: string) =>
    axiosClient
      .get<ApiResponse<ProductResponse>>(API_ENDPOINTS.products.detail(id))
      .then((r) => r.data),

  createProduct: (request: CreateProductWithConversionsRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.products.create, request)
      .then((r) => r.data),

  updateProduct: (id: string, request: UpdateProductRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.products.update(id), request)
      .then((r) => r.data),

  changeProductStatus: (id: string, status: 'Active' | 'Inactive') =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(status === 'Active' ? API_ENDPOINTS.products.reactivate(id) : API_ENDPOINTS.products.deactivate(id))
      .then((r) => r.data),

  configureStockPolicy: (id: string, request: ConfigureStockPolicyRequest) =>
    axiosClient
      .patch<ApiResponse<unknown>>(API_ENDPOINTS.products.stockPolicy(id), request)
      .then((r) => r.data),

  getStockPolicies: (id: string) =>
    axiosClient
      .get<ApiResponse<ProductWarehousePolicy[]>>(API_ENDPOINTS.products.stockPolicies(id))
      .then((r) => r.data),

  changeStockPolicyStatus: (productId: string, policyId: string, status: 'Active' | 'Inactive') =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(status === 'Active' ? API_ENDPOINTS.products.reactivateStockPolicy(productId, policyId) : API_ENDPOINTS.products.deactivateStockPolicy(productId, policyId))
      .then((r) => r.data),

  getUnitConversions: (id: string) =>
    axiosClient
      .get<ApiResponse<ProductUnitConversion[]>>(API_ENDPOINTS.products.unitConversions(id))
      .then((r) => r.data),

  createUnitConversion: (id: string, request: CreateProductUnitConversionRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.products.unitConversions(id), request)
      .then((r) => r.data),

  updateUnitConversion: (
    productId: string,
    conversionId: string,
    request: UpdateProductUnitConversionRequest
  ) =>
    axiosClient
      .put<
        ApiResponse<unknown>
      >(API_ENDPOINTS.products.unitConversion(productId, conversionId), request)
      .then((r) => r.data),

  changeUnitConversionStatus: (
    productId: string,
    conversionId: string,
    status: 'Active' | 'Inactive'
  ) =>
    axiosClient
      .patch<
        ApiResponse<unknown>
      >(status === 'Active' ? API_ENDPOINTS.products.reactivateUnitConversion(productId, conversionId) : API_ENDPOINTS.products.deactivateUnitConversion(productId, conversionId))
      .then((r) => r.data),

  getProductLots: (id: string, params: ProductLotQuery) =>
    axiosClient
      .get<ApiResponse<ProductLot[]>>(API_ENDPOINTS.products.lots(id), { params })
      .then((r) => r.data),

  updateProductLotStatus: (productId: string, lotId: string, status: 'Active' | 'Blocked') =>
    axiosClient
      .patch<ApiResponse<unknown>>(API_ENDPOINTS.products.lotStatus(productId, lotId), { status })
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
