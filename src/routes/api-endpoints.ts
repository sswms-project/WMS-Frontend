export const API_ENDPOINTS = {
  // Public endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    captchaChallenge: '/auth/captcha/challenge',
    refreshToken: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
    verify2fa: '/auth/verify-2fa',
    changePassword: '/auth/change-password',
  },
  // Authenticated endpoints
  settings: {
    setup2fa: '/settings/2fa/setup',
    confirm2fa: '/settings/2fa/confirm',
    disable2fa: '/settings/2fa',
  },
  notifications: {
    list: '/notifications',
    markRead: (notificationId: string) => `/notifications/${notificationId}/read`,
    markAllRead: '/notifications/read-all',
  },
  auditLogs: {
    list: '/audit-logs',
  },
  platformAdmin: {
    dashboard: '/admin/dashboard',
    tenants: '/admin/tenants',
    tenantDetail: (tenantId: string) => `/admin/tenants/${tenantId}`,
    suspendTenant: (tenantId: string) => `/admin/tenants/${tenantId}/suspend`,
    reactivateTenant: (tenantId: string) => `/admin/tenants/${tenantId}/reactivate`,
    approveTenantRegistration: (tenantId: string) =>
      `/admin/tenants/${tenantId}/approve-registration`,
    rejectTenantRegistration: (tenantId: string) =>
      `/admin/tenants/${tenantId}/reject-registration`,
    subscriptionPlans: '/subscription-plans/admin',
    activateSubscriptionPlan: (planId: string) => `/subscription-plans/${planId}/activate`,
  },
  tenantRolePermissions: {
    workspace: '/tenant-role-permissions',
    assign: (roleId: string) => `/tenant-role-permissions/${roleId}`,
  },
  tenantUserPermissions: {
    subjects: '/tenant-user-permissions/subjects',
    detail: (userId: string) => `/tenant-user-permissions/${userId}`,
    assign: (userId: string) => `/tenant-user-permissions/${userId}`,
    reset: (userId: string) => `/tenant-user-permissions/${userId}/reset`,
  },
  organization: {
    me: '/organization',
  },
  myWarehouseTasks: {
    current: '/my-warehouse-tasks',
  },
  staff: {
    managers: '/managers',
    list: '/staff',
    detail: (userId: string) => `/staff/${userId}`,
    terminate: (userId: string) => `/staff/${userId}/terminate`,
    assignManager: (warehouseId: string) => `/warehouses/${warehouseId}/manager`,
    warehouseAssignments: (userId: string) => `/staff/${userId}/warehouses`,
  },
  warehouses: {
    list: '/warehouses',
    create: '/warehouses',
    detail: (warehouseId: string) => `/warehouses/${warehouseId}`,
    update: (warehouseId: string) => `/warehouses/${warehouseId}`,
    layout: (warehouseId: string) => `/warehouses/${warehouseId}/layout`,
    layoutScene: (warehouseId: string) => `/warehouses/${warehouseId}/layout/scene`,
    locations: (warehouseId: string) => `/warehouses/${warehouseId}/locations`,
    createZone: (warehouseId: string) => `/warehouses/${warehouseId}/zones`,
    updateZone: (warehouseId: string, zoneId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}`,
    deactivateZone: (warehouseId: string, zoneId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/deactivate`,
    reactivateZone: (warehouseId: string, zoneId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/reactivate`,
    createRack: (warehouseId: string, zoneId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/racks`,
    updateRack: (warehouseId: string, zoneId: string, rackId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/racks/${rackId}`,
    deactivateRack: (warehouseId: string, zoneId: string, rackId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/racks/${rackId}/deactivate`,
    reactivateRack: (warehouseId: string, zoneId: string, rackId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/racks/${rackId}/reactivate`,
    createSlot: (warehouseId: string, rackId: string) =>
      `/warehouses/${warehouseId}/racks/${rackId}/slots`,
    updateSlot: (warehouseId: string, rackId: string, slotId: string) =>
      `/warehouses/${warehouseId}/racks/${rackId}/slots/${slotId}`,
    deactivateSlot: (warehouseId: string, rackId: string, slotId: string) =>
      `/warehouses/${warehouseId}/racks/${rackId}/slots/${slotId}/deactivate`,
    reactivateSlot: (warehouseId: string, rackId: string, slotId: string) =>
      `/warehouses/${warehouseId}/racks/${rackId}/slots/${slotId}/reactivate`,
    locationBarcode: (warehouseId: string, locationType: string, locationId: string) =>
      `/warehouses/${warehouseId}/locations/${locationType.toLowerCase()}/${locationId}/barcode`,
    deactivate: (warehouseId: string) => `/warehouses/${warehouseId}/deactivate`,
    reactivate: (warehouseId: string) => `/warehouses/${warehouseId}/reactivate`,
  },
  inventory: {
    list: '/inventory',
    evidence: '/inventory/evidence',
    evidenceFile: (id: string) => `/inventory/evidence/${id}`,
    movements: '/inventory/movements',
    reservations: '/inventory/reservations',
    damaged: '/inventory/damaged',
    damageCases: '/inventory/damage-cases',
    discrepancies: '/inventory/discrepancies',
    reviewDiscrepancy: (id: string) => `/inventory/discrepancies/${id}/review`,
    addDiscrepancyEvidence: (id: string) => `/inventory/discrepancies/${id}/evidence`,
    damageCaseDisposition: (id: string) => `/inventory/damage-cases/${id}/disposition`,
    addDamageCaseEvidence: (id: string) => `/inventory/damage-cases/${id}/evidence`,
    openingStocks: '/inventory/opening-stocks',
    updateOpeningStock: (id: string) => `/inventory/opening-stocks/${id}`,
    submitOpeningStock: (id: string) => `/inventory/opening-stocks/${id}/submit`,
    withdrawOpeningStock: (id: string) => `/inventory/opening-stocks/${id}/withdraw`,
    approveOpeningStock: (id: string) => `/inventory/opening-stocks/${id}/approve`,
    reviewOpeningStock: (id: string) => `/inventory/opening-stocks/${id}/review`,
    cancelOpeningStock: (id: string) => `/inventory/opening-stocks/${id}/cancel`,
    abcClassification: '/inventory/abc-classification',
    runAbcClassification: '/inventory/abc-classification/run',
    applyAbcAnalysis: (id: string) => `/inventory/abc-classification/${id}/create-cycle-count`,
    forecast: '/inventory/forecast',
    forecastRuns: '/inventory/forecast-runs',
    forecastRun: (id: string) => `/inventory/forecast-runs/${id}`,
    executeForecastRun: (id: string) => `/inventory/forecast-runs/${id}/execute`,
    evaluateForecastRun: (id: string) => `/inventory/forecast-runs/${id}/evaluate-accuracy`,
    acceptReplenishmentSuggestion: (id: string) =>
      `/inventory/replenishment-suggestions/${id}/accept`,
    acceptRebalancingSuggestion: (id: string) => `/inventory/rebalancing-suggestions/${id}/accept`,
    rejectForecastSuggestion: (id: string) => `/inventory/forecast-suggestions/${id}/reject`,
    history: '/inventory/history',
  },
  cycleCounts: {
    list: '/cycle-counts',
    create: '/cycle-counts',
    detail: (cycleCountId: string) => `/cycle-counts/${cycleCountId}`,
    allowedActions: (cycleCountId: string) => `/cycle-counts/${cycleCountId}/allowed-actions`,
    recordItem: (cycleCountId: string, itemId: string) =>
      `/cycle-counts/${cycleCountId}/items/${itemId}`,
    submit: (cycleCountId: string) => `/cycle-counts/${cycleCountId}/submit`,
    recount: (cycleCountId: string) => `/cycle-counts/${cycleCountId}/recount`,
    finalize: (cycleCountId: string) => `/cycle-counts/${cycleCountId}/finalize`,
  },
  stockAdjustments: {
    list: '/stock-adjustments',
    create: '/stock-adjustments',
    detail: (adjustmentId: string) => `/stock-adjustments/${adjustmentId}`,
    allowedActions: (adjustmentId: string) => `/stock-adjustments/${adjustmentId}/allowed-actions`,
    approve: (adjustmentId: string) => `/stock-adjustments/${adjustmentId}/approve`,
    reject: (adjustmentId: string) => `/stock-adjustments/${adjustmentId}/reject`,
  },
  suppliers: {
    list: '/suppliers',
    create: '/suppliers',
    nextCode: '/suppliers/next-code',
    detail: (supplierId: string) => `/suppliers/${supplierId}`,
    update: (supplierId: string) => `/suppliers/${supplierId}`,
    deactivate: (supplierId: string) => `/suppliers/${supplierId}/deactivate`,
    reactivate: (supplierId: string) => `/suppliers/${supplierId}/reactivate`,
  },
  inboundRequests: {
    list: '/inbound-requests',
    create: '/inbound-requests',
    detail: (inboundRequestId: string) => `/inbound-requests/${inboundRequestId}`,
    update: (inboundRequestId: string) => `/inbound-requests/${inboundRequestId}`,
    submit: (inboundRequestId: string) => `/inbound-requests/${inboundRequestId}/submit`,
    approve: (inboundRequestId: string) => `/inbound-requests/${inboundRequestId}/approve`,
    reject: (inboundRequestId: string) => `/inbound-requests/${inboundRequestId}/reject`,
    allowedActions: (inboundRequestId: string) =>
      `/inbound-requests/${inboundRequestId}/allowed-actions`,
  },
  goodsReceipts: {
    list: '/goods-receipts',
    create: '/goods-receipts',
    detail: (receiptId: string) => `/goods-receipts/${receiptId}`,
    update: (receiptId: string) => `/goods-receipts/${receiptId}`,
    receivingTasks: '/goods-receipts/receiving-tasks',
    putawayTasks: '/goods-receipts/putaway-tasks',
    submit: (receiptId: string) => `/goods-receipts/${receiptId}/submit`,
    approve: (receiptId: string) => `/goods-receipts/${receiptId}/approve`,
    reject: (receiptId: string) => `/goods-receipts/${receiptId}/reject`,
    allowedActions: (receiptId: string) => `/goods-receipts/${receiptId}/allowed-actions`,
    putaway: (receiptId: string) => `/goods-receipts/${receiptId}/putaway`,
    cancelPutawayTask: (receiptId: string) => `/goods-receipts/${receiptId}/putaway-task/cancel`,
    reconcilePutawayCancellation: (receiptId: string) =>
      `/goods-receipts/${receiptId}/putaway-task/reconcile-cancellation`,
  },
  inboundDocumentImports: {
    create: '/inbound-document-imports',
    detail: (importId: string) => `/inbound-document-imports/${importId}`,
    review: (importId: string) => `/inbound-document-imports/${importId}/review`,
    createDraft: (importId: string) => `/inbound-document-imports/${importId}/draft-receipt`,
    document: (importId: string) => `/inbound-document-imports/${importId}/document`,
  },
  invitations: {
    send: '/invitations',
    preview: (token: string) => `/invitations/${token}/preview`,
    acceptNew: (token: string) => `/invitations/${token}/accept-new`,
    list: '/invitations',
    resend: (id: string) => `/invitations/${id}/resend`,
    revoke: (id: string) => `/invitations/${id}`,
  },
  personnelImports: {
    template: '/staff/import-template',
    preview: '/staff/imports/preview',
    detail: (importId: string) => `/staff/imports/${importId}`,
    commit: (importId: string) => `/staff/imports/${importId}/commit`,
  },
  subscription: {
    me: '/subscriptions/me',
    entitlement: '/subscriptions/entitlement',
    plans: '/subscription-plans',
    planById: (id: string) => `/subscription-plans/${id}`,
    initialSelection: '/subscriptions/initial-selection',
    changePlan: '/subscriptions/change-plan',
    renew: '/subscriptions/renew',
    paymentStatus: (orderCode: string) => `/subscriptions/payments/${orderCode}/sync`,
  },
  public: {
    subscriptionPlans: '/public/subscription-plans',
    subscriptionFeatures: '/public/subscription-features',
  },
  units: {
    list: '/units',
    create: '/units',
    update: (unitId: string) => `/units/${unitId}`,
    deactivate: (unitId: string) => `/units/${unitId}/deactivate`,
    reactivate: (unitId: string) => `/units/${unitId}/reactivate`,
  },
  categories: {
    list: '/categories',
    create: '/categories',
    update: (categoryId: string) => `/categories/${categoryId}`,
    deactivate: (categoryId: string) => `/categories/${categoryId}/deactivate`,
    reactivate: (categoryId: string) => `/categories/${categoryId}/reactivate`,
  },
  products: {
    list: '/products',
    create: '/products',
    detail: (id: string) => `/products/${id}`,
    update: (id: string) => `/products/${id}`,
    image: (id: string) => `/products/${id}/image`,
    deactivate: (id: string) => `/products/${id}/deactivate`,
    reactivate: (id: string) => `/products/${id}/reactivate`,
    stockPolicy: (id: string) => `/products/${id}/stock-policy`,
    stockPolicies: (id: string) => `/products/${id}/stock-policies`,
    deactivateStockPolicy: (productId: string, policyId: string) =>
      `/products/${productId}/stock-policies/${policyId}/deactivate`,
    reactivateStockPolicy: (productId: string, policyId: string) =>
      `/products/${productId}/stock-policies/${policyId}/reactivate`,
    unitConversions: (id: string) => `/products/${id}/unit-conversions`,
    unitConversion: (productId: string, conversionId: string) =>
      `/products/${productId}/unit-conversions/${conversionId}`,
    deactivateUnitConversion: (productId: string, conversionId: string) =>
      `/products/${productId}/unit-conversions/${conversionId}/deactivate`,
    reactivateUnitConversion: (productId: string, conversionId: string) =>
      `/products/${productId}/unit-conversions/${conversionId}/reactivate`,
    lots: (id: string) => `/products/${id}/lots`,
    lotStatus: (productId: string, lotId: string) => `/products/${productId}/lots/${lotId}/status`,
    barcode: (id: string) => `/products/${id}/barcode`,
    suppliers: (id: string) => `/products/${id}/suppliers`,
    supplier: (productId: string, linkId: string) => `/products/${productId}/suppliers/${linkId}`,
    import: '/products/import',
  },
  payments: {
    history: '/payments',
    invoice: (paymentId: string) => `/payments/${paymentId}/invoice`,
    invoiceData: (paymentId: string) => `/payments/${paymentId}/invoice-data`,
  },
  transfers: {
    list: '/transfers',
    create: '/transfers',
    sourceWarehouses: '/transfers/source-warehouses',
    sourceInventory: '/transfers/source-inventory',
    detail: (transferId: string) => `/transfers/${transferId}`,
    approve: (transferId: string) => `/transfers/${transferId}/approve`,
    reject: (transferId: string) => `/transfers/${transferId}/reject`,
    dispatch: (transferId: string) => `/transfers/${transferId}/dispatch`,
    receive: (transferId: string) => `/transfers/${transferId}/receive`,
  },
  stockIssueRequests: {
    list: '/stock-issue-requests',
    create: '/stock-issue-requests',
    detail: (stockIssueRequestId: string) => `/stock-issue-requests/${stockIssueRequestId}`,
    releaseForPicking: (stockIssueRequestId: string) =>
      `/stock-issue-requests/${stockIssueRequestId}/release-for-picking`,
    picks: (stockIssueRequestId: string) => `/stock-issue-requests/${stockIssueRequestId}/picks`,
    dispatch: (stockIssueRequestId: string) =>
      `/stock-issue-requests/${stockIssueRequestId}/dispatch`,
    authorizeDispatch: (stockIssueRequestId: string) =>
      `/stock-issue-requests/${stockIssueRequestId}/authorize-dispatch`,
    removePickDetail: (stockIssueRequestId: string, pickDetailId: string) =>
      `/stock-issue-requests/${stockIssueRequestId}/pick-details/${pickDetailId}`,
    goodsReturnRequests: (stockIssueRequestId: string) =>
      `/stock-issue-requests/${stockIssueRequestId}/goods-return-requests`,
  },
  goodsReturnRequests: {
    list: '/goods-return-requests',
    detail: (goodsReturnRequestId: string) => `/goods-return-requests/${goodsReturnRequestId}`,
    approve: (goodsReturnRequestId: string) =>
      `/goods-return-requests/${goodsReturnRequestId}/approve`,
    reject: (goodsReturnRequestId: string) =>
      `/goods-return-requests/${goodsReturnRequestId}/reject`,
  },
  stockRecipients: {
    list: '/stock-recipients',
    create: '/stock-recipients',
    nextCode: '/stock-recipients/next-code',
    detail: (stockRecipientId: string) => `/stock-recipients/${stockRecipientId}`,
    update: (stockRecipientId: string) => `/stock-recipients/${stockRecipientId}`,
    deactivate: (stockRecipientId: string) => `/stock-recipients/${stockRecipientId}/deactivate`,
    reactivate: (stockRecipientId: string) => `/stock-recipients/${stockRecipientId}/reactivate`,
    issueHistory: (stockRecipientId: string) =>
      `/stock-recipients/${stockRecipientId}/issue-history`,
  },
  aiAssistant: {
    chat: '/ai/chat',
    conversations: '/ai/conversations',
    messages: (conversationId: string) => `/ai/conversations/${conversationId}/messages`,
    confirmAction: (draftId: string) => `/ai/actions/${draftId}/confirm`,
    cancelAction: (draftId: string) => `/ai/actions/${draftId}/cancel`,
  },
} as const
