import type { OutboundOrderListResponse } from '@/features/outbound/types/outbound.types'

export interface CustomerListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
}

export interface Customer {
  id: string
  customerCode: string
  customerName: string
  phone: string
  email: string | null
  address: string
  createdAt: string
  modifiedAt: string | null
}

export interface CustomerListResponse {
  items: Customer[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CustomerOrderHistoryQuery {
  pageNumber: number
  pageSize: number
}

export type CustomerOrderHistoryResponse = OutboundOrderListResponse

export interface CreateCustomerRequest {
  customerName: string
  phone: string
  email: string | null
  address: string
}

export type UpdateCustomerRequest = CreateCustomerRequest
