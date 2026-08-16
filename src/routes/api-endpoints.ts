export const API_ENDPOINTS = {
  // Public endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
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
  organization: {
    me: '/organization',
  },
  staff: {
    managers: '/managers',
    list: '/staff',
    detail: (userId: string) => `/staff/${userId}`,
    deactivate: (userId: string) => `/staff/${userId}/deactivate`,
    reactivate: (userId: string) => `/staff/${userId}/reactivate`,
    assignManager: (warehouseId: string) => `/warehouses/${warehouseId}/manager`,
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
    createRack: (warehouseId: string, zoneId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/racks`,
    updateRack: (warehouseId: string, zoneId: string, rackId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/racks/${rackId}`,
    deactivateRack: (warehouseId: string, zoneId: string, rackId: string) =>
      `/warehouses/${warehouseId}/zones/${zoneId}/racks/${rackId}/deactivate`,
    createSlot: (warehouseId: string, rackId: string) =>
      `/warehouses/${warehouseId}/racks/${rackId}/slots`,
    updateSlot: (warehouseId: string, rackId: string, slotId: string) =>
      `/warehouses/${warehouseId}/racks/${rackId}/slots/${slotId}`,
    deactivateSlot: (warehouseId: string, rackId: string, slotId: string) =>
      `/warehouses/${warehouseId}/racks/${rackId}/slots/${slotId}/deactivate`,
    locationBarcode: (warehouseId: string, locationType: string, locationId: string) =>
      `/warehouses/${warehouseId}/locations/${locationType.toLowerCase()}/${locationId}/barcode`,
    deactivate: (warehouseId: string) => `/warehouses/${warehouseId}/deactivate`,
  },
  invitations: {
    list: '/invitations',
    send: '/invitations',
    accept: (token: string) => `/invitations/${token}/accept`,
    revoke: (invitationId: string) => `/invitations/${invitationId}`,
    resend: (invitationId: string) => `/invitations/${invitationId}/resend`,
  },
  subscription: {
    me: '/subscriptions/me',
    plans: '/subscription-plans',
    planById: (id: string) => `/subscription-plans/${id}`,
    upgrade: '/subscriptions/upgrade',
    renew: '/subscriptions/renew',
    cancel: '/subscriptions/me',
  },
  public: {
    subscriptionPlans: '/public/subscription-plans',
  },
  payments: {
    history: '/payments',
    invoice: (paymentId: string) => `/payments/${paymentId}/invoice`,
    invoiceData: (paymentId: string) => `/payments/${paymentId}/invoice-data`,
  },
} as const
