import type { QueryInfo } from '@/types/api'
import type { PaymentHistoryQuery } from '@/features/subscription/types/subscription.types'
import type { StaffDirectoryKind, StaffQuery } from '@/features/staff/types/staff.types'
import type { InvitationQuery } from '@/features/staff/types/invitation.types'

export const queryKeys = {
  organization: {
    all: ['organization'] as const,
    me: ['organization', 'me'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (kind: StaffDirectoryKind, params: StaffQuery) => ['staff', kind, params] as const,
    detail: (userId: string) => ['staff', 'detail', userId] as const,
  },
  invitations: {
    all: ['invitations'] as const,
    list: (params: InvitationQuery) => ['invitations', 'list', params] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    me: ['subscription', 'me'] as const,
    plans: ['subscription', 'plans'] as const,
    publicPlans: ['subscription', 'public-plans'] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (params?: PaymentHistoryQuery) => ['payments', 'list', params] as const,
    invoiceData: (paymentId: string) => ['payments', 'invoice-data', paymentId] as const,
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
}
