import { USER_ROLES } from '@/config/roles'
import { subscriptionService } from '@/features/subscription/services/subscription.service'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import type { AuthUser } from '../types/auth.types'
import type { Route } from 'next'

export async function resolvePostLoginRoute(
  user: AuthUser,
  preferredRoute?: Route | null
): Promise<Route> {
  if (user.role !== USER_ROLES.TenantOwner) {
    return preferredRoute ?? APP_ROUTES.dashboard
  }

  try {
    const response = await subscriptionService.getCurrentSubscription()
    const subscription = response.data
    if (!subscription || subscription.status === 'Pending') {
      return APP_ROUTES.subscription
    }
  } catch (error) {
    logger.warn('[auth] Unable to resolve subscription onboarding route', error)
  }

  return preferredRoute ?? APP_ROUTES.dashboard
}
