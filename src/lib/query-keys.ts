import type { QueryInfo } from '@/types/api'
import type { PaymentHistoryQuery } from '@/features/subscription/types/subscription.types'
import type { StaffDirectoryKind, StaffQuery } from '@/features/staff/types/staff.types'
import type { InvitationQuery } from '@/features/staff/types/invitation.types'
import type {
  WarehouseLocationQuery,
  WarehouseLocationType,
} from '@/features/warehouse/types/warehouse.types'
import type {
  InboundListQuery,
  PutawayTaskQuery,
  ReceivingTaskQuery,
} from '@/features/inbound/types/inbound.types'
import type {
  LookupQuery,
  PurchaseOrderListQuery,
} from '@/features/purchase-order/types/purchase-order.types'
import type { SupplierListQuery } from '@/features/supplier/types/supplier.types'
import type {
  InventoryListQuery,
  InventoryAbcQuery,
  InventoryReservationQuery,
  StockMovementListQuery,
} from '@/features/inventory/types/inventory.types'
import type { ProductListQuery } from '@/features/product/types/product.types'
import type {
  TransferListQuery,
  TransferSourceInventoryQuery,
  TransferSourceWarehouseQuery,
} from '@/features/transfer/types/transfer.types'
import type {
  OutboundOrderListQuery,
  ReturnListQuery,
} from '@/features/outbound/types/outbound.types'
import type { DeliveryListQuery } from '@/features/delivery/types/delivery.types'
import type {
  CustomerListQuery,
  CustomerOrderHistoryQuery,
} from '@/features/customer/types/customer.types'
import type {
  CycleCountListQuery,
  StockAdjustmentListQuery,
} from '@/features/cycle-count/types/cycle-count.types'

export const queryKeys = {
  tenantRolePermissions: {
    all: ['tenant-role-permissions'] as const,
    workspace: ['tenant-role-permissions', 'workspace'] as const,
  },
  organization: {
    all: ['organization'] as const,
    me: ['organization', 'me'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (kind: StaffDirectoryKind, params: StaffQuery) => ['staff', kind, params] as const,
    detail: (userId: string) => ['staff', 'detail', userId] as const,
    allInvitations: ['staff', 'invitations'] as const,
    invitations: (params: InvitationQuery) => ['staff', 'invitations', params] as const,
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
    layout: (id: string) => ['warehouses', 'detail', id, 'layout'] as const,
    layoutScene: (id: string) => ['warehouses', 'detail', id, 'layout', 'scene'] as const,
    locationsAll: (id: string) => ['warehouses', 'detail', id, 'locations'] as const,
    locations: (id: string, params: WarehouseLocationQuery) =>
      ['warehouses', 'detail', id, 'locations', params] as const,
    barcode: (id: string, type: WarehouseLocationType, locationId: string) =>
      ['warehouses', 'detail', id, 'barcode', type, locationId] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (params: InventoryListQuery) => ['inventory', 'list', params] as const,
    movements: (params: StockMovementListQuery) => ['inventory', 'movements', params] as const,
    reservations: (params: InventoryReservationQuery) =>
      ['inventory', 'reservations', params] as const,
    abc: (params: InventoryAbcQuery) => ['inventory', 'abc-classification', params] as const,
    transactions: (params?: QueryInfo) => ['inventory', 'transactions', params] as const,
  },
  units: {
    all: ['units'] as const,
    list: ['units', 'list'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: ['categories', 'list'] as const,
  },
  cycleCounts: {
    all: ['cycle-counts'] as const,
    list: (params: CycleCountListQuery) => ['cycle-counts', 'list', params] as const,
    detail: (id: string) => ['cycle-counts', 'detail', id] as const,
    allowedActions: (id: string) => ['cycle-counts', 'detail', id, 'allowed-actions'] as const,
  },
  stockAdjustments: {
    all: ['stock-adjustments'] as const,
    list: (params: StockAdjustmentListQuery) => ['stock-adjustments', 'list', params] as const,
    detail: (id: string) => ['stock-adjustments', 'detail', id] as const,
    allowedActions: (id: string) => ['stock-adjustments', 'detail', id, 'allowed-actions'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params?: ProductListQuery) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  suppliers: {
    all: ['suppliers'] as const,
    lists: ['suppliers', 'list'] as const,
    list: (params: LookupQuery | SupplierListQuery) => ['suppliers', 'list', params] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
  },
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    lists: ['purchase-orders', 'list'] as const,
    list: (params: PurchaseOrderListQuery) => ['purchase-orders', 'list', params] as const,
    detail: (id: string) => ['purchase-orders', 'detail', id] as const,
    allowedActions: (id: string) => ['purchase-orders', 'detail', id, 'allowed-actions'] as const,
    products: (params: LookupQuery) => ['products', 'purchase-order-options', params] as const,
  },
  inboundReceipts: {
    all: ['inbound-receipts'] as const,
    lists: ['inbound-receipts', 'list'] as const,
    list: (params: InboundListQuery) => ['inbound-receipts', 'list', params] as const,
    detail: (id: string) => ['inbound-receipts', 'detail', id] as const,
    allowedActions: (id: string) => ['inbound-receipts', 'detail', id, 'allowed-actions'] as const,
    receivingTasks: (params: ReceivingTaskQuery) =>
      ['inbound-receipts', 'receiving-tasks', params] as const,
    putawayTasks: (params: PutawayTaskQuery) =>
      ['inbound-receipts', 'putaway-tasks', params] as const,
  },
  transfers: {
    all: ['transfers'] as const,
    lists: ['transfers', 'list'] as const,
    list: (params: TransferListQuery) => ['transfers', 'list', params] as const,
    detail: (id: string) => ['transfers', 'detail', id] as const,
    sourceWarehouses: (params: TransferSourceWarehouseQuery) =>
      ['transfers', 'source-warehouses', params] as const,
    sourceInventory: (params: TransferSourceInventoryQuery) =>
      ['transfers', 'source-inventory', params] as const,
  },
  outboundOrders: {
    all: ['outbound-orders'] as const,
    lists: ['outbound-orders', 'list'] as const,
    list: (params: OutboundOrderListQuery) => ['outbound-orders', 'list', params] as const,
    detail: (id: string) => ['outbound-orders', 'detail', id] as const,
  },
  returns: {
    all: ['returns'] as const,
    lists: ['returns', 'list'] as const,
    list: (params: ReturnListQuery) => ['returns', 'list', params] as const,
    detail: (id: string) => ['returns', 'detail', id] as const,
  },
  deliveries: {
    all: ['deliveries'] as const,
    lists: ['deliveries', 'list'] as const,
    list: (params: DeliveryListQuery) => ['deliveries', 'list', params] as const,
  },
  customers: {
    all: ['customers'] as const,
    lists: ['customers', 'list'] as const,
    list: (params: CustomerListQuery) => ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    orderHistory: (id: string, params: CustomerOrderHistoryQuery) =>
      ['customers', 'detail', id, 'orders', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: QueryInfo) => ['notifications', 'list', params] as const,
  },
}
