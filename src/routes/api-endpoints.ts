export const API_ENDPOINTS = {
  // Public endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
    refreshToken: '/auth/refresh-token',
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
  },
} as const
