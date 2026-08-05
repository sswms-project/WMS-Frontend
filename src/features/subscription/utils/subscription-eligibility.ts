import type { PlanActionState, SubscriptionPlanResponse } from '../types/subscription.types'

export function isDowngradePlan(
  currentPlanPrice: number | undefined,
  candidatePlan: SubscriptionPlanResponse
): boolean {
  if (currentPlanPrice === undefined) return false
  return candidatePlan.price < currentPlanPrice
}

export function getPlanActionState(
  plan: SubscriptionPlanResponse,
  currentPlan: SubscriptionPlanResponse | undefined,
  isPending: boolean
): PlanActionState {
  if (currentPlan?.id === plan.id || currentPlan?.planName === plan.planName) {
    return { disabled: true, label: 'Đang sử dụng' }
  }

  if (isDowngradePlan(currentPlan?.price, plan)) {
    return {
      disabled: true,
      label: 'Không hỗ trợ hạ gói',
      tooltip: 'Không hỗ trợ hạ gói',
    }
  }

  if (isPending) {
    return { disabled: true, label: 'Đang xử lý...' }
  }

  return { disabled: false, label: 'Nâng cấp' }
}
