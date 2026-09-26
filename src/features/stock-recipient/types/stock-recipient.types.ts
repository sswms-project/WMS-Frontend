import type { StockIssueRequestListResponse } from '@/features/stock-issue/types/stock-issue.types'

export interface StockRecipientListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  status?: 'Active' | 'Inactive'
}

export interface StockRecipient {
  id: string
  recipientCode: string
  recipientName: string
  taxCode: string | null
  phone: string
  email: string | null
  address: string
  shippingAddress: string | null
  recipientType: 'Organization' | 'Individual'
  contactSalutation: string | null
  contactName: string | null
  contactMobile: string | null
  contactChannel: string | null
  contactChannelName: string | null
  status: 'Active' | 'Inactive'
  createdAt: string
  modifiedAt: string | null
}

export interface StockRecipientListResponse {
  items: StockRecipient[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface StockRecipientIssueHistoryQuery {
  pageNumber: number
  pageSize: number
}

export type StockRecipientIssueHistoryResponse = StockIssueRequestListResponse

export interface CreateStockRecipientRequest {
  recipientCode: string
  recipientName: string
  taxCode: string | null
  phone: string
  email: string | null
  address: string
  shippingAddress: string | null
  recipientType: 'Organization' | 'Individual'
  contactSalutation: string | null
  contactName: string | null
  contactMobile: string | null
  contactChannel: string | null
  contactChannelName: string | null
}

export type UpdateStockRecipientRequest = CreateStockRecipientRequest
