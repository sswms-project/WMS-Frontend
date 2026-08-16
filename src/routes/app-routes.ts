export const APP_ROUTES = {
  home: '/',
  pricing: '/pricing',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verify2fa: '/auth/verify-2fa',
  },
  dashboard: '/dashboard',
  subscription: '/subscription',
  organization: '/organization',
  staff: '/staff',
  invitations: {
    accept: '/invitations/accept',
  },
  dashboardByRole: {
    tenant: '/dashboard/tenant',
    manager: '/dashboard/manager',
    staff: '/dashboard/staff',
  },
  warehouses: '/warehouses',
  warehouseDetail: (warehouseId: string) => `/warehouses/${warehouseId}`,
  warehouseLayout: (warehouseId: string) => `/warehouses/${warehouseId}/layout`,
  warehouseLayoutDesigner: (warehouseId: string) => `/warehouses/${warehouseId}/layout/designer`,
  warehouseLocations: (warehouseId: string) => `/warehouses/${warehouseId}/locations`,
  warehouseLocationBarcode: (warehouseId: string, locationType: string, locationId: string) =>
    `/warehouses/${warehouseId}/locations/${locationType.toLowerCase()}/${locationId}/barcode`,
  inventory: '/inventory',
  orders: '/orders',
  delivery: '/delivery',
  unauthorized: '/unauthorized',
  admin: {
    roles: '/admin/roles',
    subscriptionPlans: '/admin/subscription-plans',
  },
  settings: {
    security: '/settings/security',
  },
} as const
