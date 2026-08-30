import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  CreateCustomerRequest,
  Customer,
  CustomerListQuery,
  CustomerListResponse,
  CustomerOrderHistoryQuery,
  CustomerOrderHistoryResponse,
  UpdateCustomerRequest,
} from '../types/customer.types'

export const customerService = {
  getCustomers: (params: CustomerListQuery) =>
    axiosClient
      .get<ApiResponse<CustomerListResponse>>(API_ENDPOINTS.customers.list, { params })
      .then((response) => response.data),

  getCustomer: (customerId: string) =>
    axiosClient
      .get<ApiResponse<Customer>>(API_ENDPOINTS.customers.detail(customerId))
      .then((response) => response.data),

  getOrderHistory: (customerId: string, params: CustomerOrderHistoryQuery) =>
    axiosClient
      .get<
        ApiResponse<CustomerOrderHistoryResponse>
      >(API_ENDPOINTS.customers.orderHistory(customerId), { params })
      .then((response) => response.data),

  createCustomer: (request: CreateCustomerRequest) =>
    axiosClient
      .post<ApiResponse<string>>(API_ENDPOINTS.customers.create, request)
      .then((response) => response.data),

  updateCustomer: (customerId: string, request: UpdateCustomerRequest) =>
    axiosClient
      .put<ApiResponse<unknown>>(API_ENDPOINTS.customers.update(customerId), request)
      .then((response) => response.data),
}
