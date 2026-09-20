import type { StockIssueRequestListResponse } from '@/features/stock-issue/types/stock-issue.types'

export interface StockRecipientListQuery {
  pageNumber: number
  pageSize: number
  searchTerm?: string
}

export interface StockRecipient {
  id: string
  recipientCode: string
  recipientName: string
  phone: string
  email: string | null
  address: string
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
  recipientName: string
  phone: string
  email: string | null
  address: string
}

export type UpdateStockRecipientRequest = CreateStockRecipientRequest
