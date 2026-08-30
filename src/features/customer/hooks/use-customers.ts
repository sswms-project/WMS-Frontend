import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'
import { customerService } from '../services/customer.service'
import type {
  CreateCustomerRequest,
  Customer,
  CustomerListQuery,
  CustomerListResponse,
  CustomerOrderHistoryQuery,
  CustomerOrderHistoryResponse,
  UpdateCustomerRequest,
} from '../types/customer.types'

interface UpdateCustomerVariables {
  customerId: string
  request: UpdateCustomerRequest
}

export function useCustomersQuery(params: CustomerListQuery) {
  return useQuery<CustomerListResponse, ApiErrorResponse>({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customerService.getCustomers(params).then((response) => response.data),
    placeholderData: (previousData) => previousData,
  })
}

export function useCustomerQuery(customerId: string) {
  return useQuery<Customer, ApiErrorResponse>({
    queryKey: queryKeys.customers.detail(customerId),
    queryFn: () => customerService.getCustomer(customerId).then((response) => response.data),
  })
}

export function useCustomerOrderHistoryQuery(
  customerId: string,
  params: CustomerOrderHistoryQuery
) {
  return useQuery<CustomerOrderHistoryResponse, ApiErrorResponse>({
    queryKey: queryKeys.customers.orderHistory(customerId, params),
    queryFn: () =>
      customerService.getOrderHistory(customerId, params).then((response) => response.data),
  })
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<string>, ApiErrorResponse, CreateCustomerRequest>({
    mutationFn: customerService.createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
    onError: (error) => logger.error(error),
  })
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, ApiErrorResponse, UpdateCustomerVariables>({
    mutationFn: ({ customerId, request }) => customerService.updateCustomer(customerId, request),
    onSuccess: (_, { customerId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) }),
      ]),
    onError: (error) => logger.error(error),
  })
}
