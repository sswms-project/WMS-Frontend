import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse } from '@/types/api'
import { productService } from '../services/product.service'
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

export function useUnitsQuery() {
  return useQuery<UnitResponse[], ApiErrorResponse>({
    queryKey: queryKeys.units.list,
    queryFn: () => productService.getUnits().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoriesQuery() {
  return useQuery<CategoryResponse[], ApiErrorResponse>({
    queryKey: queryKeys.categories.list,
    queryFn: () => productService.getCategories().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductListQuery(params?: ProductListQuery) {
  return useQuery<ProductListResponse, ApiErrorResponse>({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productService.getProducts(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useProductDetailQuery(id: string | null) {
  return useQuery<ProductResponse, ApiErrorResponse>({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => productService.getProductById(id ?? '').then((r) => r.data),
    enabled: Boolean(id),
  })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation<string, ApiErrorResponse, CreateProductRequest>({
    mutationFn: (request) => productService.createProduct(request).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (error) => logger.error(formatApiError(error)),
  })
}

export function useUpdateProductMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation<unknown, ApiErrorResponse, UpdateProductRequest>({
    mutationFn: (request) => productService.updateProduct(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
    },
    onError: (error) => logger.error(formatApiError(error)),
  })
}

export function useConfigureStockPolicyMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation<unknown, ApiErrorResponse, ConfigureStockPolicyRequest>({
    mutationFn: (request) => productService.configureStockPolicy(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
    },
    onError: (error) => logger.error(formatApiError(error)),
  })
}

export function useGenerateBarcodeMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation<unknown, ApiErrorResponse, void>({
    mutationFn: () => productService.generateBarcode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
    },
    onError: (error) => logger.error(formatApiError(error)),
  })
}

export function useImportProductsMutation() {
  const queryClient = useQueryClient()
  return useMutation<unknown, ApiErrorResponse, ImportProductsRequest>({
    mutationFn: (request) => productService.importProducts(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (error) => logger.error(formatApiError(error)),
  })
}
