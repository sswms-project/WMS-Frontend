import type { QueryInfo } from '@/types/api'

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  warehouses: {
    all: ['warehouses'] as const,
    list: (params?: QueryInfo) => ['warehouses', 'list', params] as const,
    detail: (id: string) => ['warehouses', 'detail', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (params?: QueryInfo) => ['inventory', 'list', params] as const,
    transactions: (params?: QueryInfo) => ['inventory', 'transactions', params] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params?: QueryInfo) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    list: (params?: QueryInfo) => ['purchase-orders', 'list', params] as const,
    detail: (id: string) => ['purchase-orders', 'detail', id] as const,
  },
  outboundOrders: {
    all: ['outbound-orders'] as const,
    list: (params?: QueryInfo) => ['outbound-orders', 'list', params] as const,
    detail: (id: string) => ['outbound-orders', 'detail', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (params?: QueryInfo) => ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: QueryInfo) => ['notifications', 'list', params] as const,
  },
  subscriptionPlans: {
    all: ['subscription-plans'] as const,
  },
}
