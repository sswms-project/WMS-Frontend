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
  InboundRequestListQuery,
} from '@/features/inbound-request/types/inbound-request.types'
import type { SupplierListQuery } from '@/features/supplier/types/supplier.types'
import type {
  InventoryListQuery,
  InventoryAbcQuery,
  InventoryForecastQuery,
  InventoryReservationQuery,
  InventoryStockHistoryQuery,
  StockMovementListQuery,
} from '@/features/inventory/types/inventory.types'
import type { ProductListQuery, ProductLotQuery } from '@/features/product/types/product.types'
import type {
  TransferListQuery,
  TransferSourceInventoryQuery,
  TransferSourceWarehouseQuery,
} from '@/features/transfer/types/transfer.types'
import type {
  StockIssueRequestListQuery,
  GoodsReturnRequestListQuery,
} from '@/features/stock-issue/types/stock-issue.types'
import type {
  StockRecipientListQuery,
  StockRecipientIssueHistoryQuery,
} from '@/features/stock-recipient/types/stock-recipient.types'
import type {
  CycleCountListQuery,
  StockAdjustmentListQuery,
} from '@/features/cycle-count/types/cycle-count.types'
import type {
  AuditLogQuery,
  NotificationQuery,
} from '@/features/platform-services/types/platform-services.types'
import type { AdminSubscriptionPlanQuery, TenantQuery } from '@/features/admin/types/admin.types'
import type { TenantUserPermissionSubjectQuery } from '@/features/access-control/types/tenant-access-control.types'

export const queryKeys = {
  platformAdmin: {
    all: ['platform-admin'] as const,
    dashboard: ['platform-admin', 'dashboard'] as const,
    tenants: ['platform-admin', 'tenants'] as const,
    tenantList: (params: TenantQuery) => ['platform-admin', 'tenants', params] as const,
    tenantDetail: (tenantId: string) => ['platform-admin', 'tenants', tenantId] as const,
    plans: (params: AdminSubscriptionPlanQuery) => ['platform-admin', 'plans', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params: NotificationQuery) => ['notifications', 'list', params] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
    list: (params: AuditLogQuery) => ['audit-logs', 'list', params] as const,
  },
  tenantRolePermissions: {
    all: ['tenant-role-permissions'] as const,
    workspace: ['tenant-role-permissions', 'workspace'] as const,
  },
  tenantUserPermissions: {
    all: ['tenant-user-permissions'] as const,
    allSubjects: ['tenant-user-permissions', 'subjects'] as const,
    subjects: (params: TenantUserPermissionSubjectQuery) =>
      ['tenant-user-permissions', 'subjects', params] as const,
    detail: (userId: string) => ['tenant-user-permissions', 'detail', userId] as const,
  },
  organization: {
    all: ['organization'] as const,
    me: ['organization', 'me'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (kind: StaffDirectoryKind, params: StaffQuery) => ['staff', kind, params] as const,
    detail: (userId: string) => ['staff', 'detail', userId] as const,
    warehouseAssignments: (userId: string) => ['staff', 'warehouses', userId] as const,
    allInvitations: ['staff', 'invitations'] as const,
    invitations: (params: InvitationQuery) => ['staff', 'invitations', params] as const,
    invitationPreview: (token: string) => ['staff', 'invitation-preview', token] as const,
    personnelImport: (importId: string) => ['staff', 'personnel-import', importId] as const,
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
    invitationOptions: (searchText: string) =>
      ['warehouses', 'invitation-options', searchText] as const,
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
    forecast: (params: InventoryForecastQuery) => ['inventory', 'forecast', params] as const,
    forecastRun: (id: string) => ['inventory', 'forecast-runs', id] as const,
    history: (params: InventoryStockHistoryQuery) => ['inventory', 'history', params] as const,
  },
  units: {
    all: ['units'] as const,
    list: (status?: 'Active' | 'Inactive') => ['units', 'list', status] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (status?: 'Active' | 'Inactive') => ['categories', 'list', status] as const,
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
    suppliers: (id: string) => ['products', 'detail', id, 'suppliers'] as const,
    stockPolicies: (id: string) => ['products', 'detail', id, 'stock-policies'] as const,
    unitConversions: (id: string) => ['products', 'detail', id, 'unit-conversions'] as const,
    lots: (id: string, params: ProductLotQuery) =>
      ['products', 'detail', id, 'lots', params] as const,
  },
  suppliers: {
    all: ['suppliers'] as const,
    lists: ['suppliers', 'list'] as const,
    list: (params: LookupQuery | SupplierListQuery) => ['suppliers', 'list', params] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
    nextCode: ['suppliers', 'next-code'] as const,
  },
  inboundRequests: {
    all: ['inbound-requests'] as const,
    lists: ['inbound-requests', 'list'] as const,
    list: (params: InboundRequestListQuery) => ['inbound-requests', 'list', params] as const,
    detail: (id: string) => ['inbound-requests', 'detail', id] as const,
    allowedActions: (id: string) => ['inbound-requests', 'detail', id, 'allowed-actions'] as const,
    products: (params: LookupQuery) => ['products', 'inbound-request-options', params] as const,
  },
  goodsReceipts: {
    all: ['goods-receipts'] as const,
    lists: ['goods-receipts', 'list'] as const,
    list: (params: InboundListQuery) => ['goods-receipts', 'list', params] as const,
    detail: (id: string) => ['goods-receipts', 'detail', id] as const,
    allowedActions: (id: string) => ['goods-receipts', 'detail', id, 'allowed-actions'] as const,
    receivingTasks: (params: ReceivingTaskQuery) =>
      ['goods-receipts', 'receiving-tasks', params] as const,
    putawayTasks: (params: PutawayTaskQuery) =>
      ['goods-receipts', 'putaway-tasks', params] as const,
  },
  inboundDocumentImports: {
    all: ['inbound-document-imports'] as const,
    detail: (id: string) => ['inbound-document-imports', 'detail', id] as const,
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
  stockIssueRequests: {
    all: ['stock-issue-requests'] as const,
    lists: ['stock-issue-requests', 'list'] as const,
    list: (params: StockIssueRequestListQuery) => ['stock-issue-requests', 'list', params] as const,
    detail: (id: string) => ['stock-issue-requests', 'detail', id] as const,
  },
  goodsReturnRequests: {
    all: ['goods-return-requests'] as const,
    lists: ['goods-return-requests', 'list'] as const,
    list: (params: GoodsReturnRequestListQuery) =>
      ['goods-return-requests', 'list', params] as const,
    detail: (id: string) => ['goods-return-requests', 'detail', id] as const,
  },
  stockRecipients: {
    all: ['stock-recipients'] as const,
    lists: ['stock-recipients', 'list'] as const,
    list: (params: StockRecipientListQuery) => ['stock-recipients', 'list', params] as const,
    detail: (id: string) => ['stock-recipients', 'detail', id] as const,
    nextCode: ['stock-recipients', 'next-code'] as const,
    issueHistory: (id: string, params: StockRecipientIssueHistoryQuery) =>
      ['stock-recipients', 'detail', id, 'issue-history', params] as const,
  },
  aiAssistant: {
    all: ['ai-assistant'] as const,
    conversations: ['ai-assistant', 'conversations'] as const,
    messages: (conversationId: string) => ['ai-assistant', 'messages', conversationId] as const,
  },
}
