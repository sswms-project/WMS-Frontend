'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { supplierService } from '../services/supplier.service'
import type {
  SaveSupplierRequest,
  Supplier,
  SupplierListQuery,
  SupplierListResponse,
  UpdateSupplierVariables,
} from '../types/supplier.types'

export function useSuppliersQuery(params: SupplierListQuery) {
  return useQuery<SupplierListResponse, ApiErrorResponse>({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => supplierService.getSuppliers(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useSupplierQuery(supplierId: string) {
  return useQuery<Supplier, ApiErrorResponse>({
    queryKey: queryKeys.suppliers.detail(supplierId),
    queryFn: () => supplierService.getSupplier(supplierId).then((response) => response.data),
    enabled: Boolean(supplierId),
  })
}

function useInvalidateSuppliers() {
  const queryClient = useQueryClient()

  return async (supplierId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all }),
      ...(supplierId
        ? [queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(supplierId) })]
        : []),
    ])
  }
}

export function useCreateSupplierMutation() {
  const invalidateSuppliers = useInvalidateSuppliers()

  return useMutation<ApiResponse<string>, ApiErrorResponse, SaveSupplierRequest>({
    mutationFn: supplierService.createSupplier,
    onSuccess: () => invalidateSuppliers(),
    onError: (error) => logger.error(error),
  })
}

export function useUpdateSupplierMutation() {
  const invalidateSuppliers = useInvalidateSuppliers()

  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateSupplierVariables>({
    mutationFn: ({ supplierId, request }) => supplierService.updateSupplier(supplierId, request),
    onSuccess: (_, variables) => invalidateSuppliers(variables.supplierId),
    onError: (error) => logger.error(error),
  })
}

export function useDeactivateSupplierMutation() {
  const invalidateSuppliers = useInvalidateSuppliers()

  return useMutation<void, ApiErrorResponse, string>({
    mutationFn: supplierService.deactivateSupplier,
    onSuccess: (_, supplierId) => invalidateSuppliers(supplierId),
    onError: (error) => logger.error(error),
  })
}

export function useReactivateSupplierMutation() {
  const invalidateSuppliers = useInvalidateSuppliers()

  return useMutation<void, ApiErrorResponse, string>({
    mutationFn: supplierService.reactivateSupplier,
    onSuccess: (_, supplierId) => invalidateSuppliers(supplierId),
    onError: (error) => logger.error(error),
  })
}
