import type {
  BillingCycle,
  PlanActionState,
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
} from '../types/subscription.types'
import { getPlanPrice, normalizeBillingCycle } from './format-subscription'

export function isDowngradePlan(
  currentPlanPrice: number | undefined,
  candidatePlan: SubscriptionPlanResponse,
  billingCycle: BillingCycle
): boolean {
  if (currentPlanPrice === undefined) return false
  return getPlanPrice(candidatePlan, billingCycle) < currentPlanPrice
}

export function getPlanActionState(
  plan: SubscriptionPlanResponse,
  currentPlan: SubscriptionPlanResponse | undefined,
  subscription: SubscriptionStatusResponse | null | undefined,
  billingCycle: BillingCycle,
  isPending: boolean
): PlanActionState {
  if (!subscription) {
    return {
      disabled: isPending,
      label: isPending ? 'Đang xử lý…' : 'Chọn gói',
    }
  }

  const isCurrentPlan = currentPlan?.id === plan.id || currentPlan?.planName === plan.planName
  const isCurrentCycle = normalizeBillingCycle(subscription?.billingCycle) === billingCycle

  if (isCurrentPlan && isCurrentCycle) {
    return { disabled: true, label: 'Đang sử dụng' }
  }

  if (isPending) {
    return { disabled: true, label: 'Đang xử lý…' }
  }

  if (isCurrentPlan) {
    return {
      disabled: false,
      label: billingCycle === 'Yearly' ? 'Chuyển sang năm' : 'Chuyển sang tháng',
    }
  }

  if (isDowngradePlan(subscription?.planPrice, plan, billingCycle)) {
    return {
      disabled: false,
      label: 'Chuyển vào kỳ sau',
      tooltip: 'Gói có giá thấp hơn sẽ được áp dụng từ kỳ thanh toán kế tiếp.',
    }
  }

  return { disabled: false, label: 'Nâng cấp' }
}

export function canApplyPlanChangeImmediately(
  plan: SubscriptionPlanResponse,
  subscription: SubscriptionStatusResponse,
  billingCycle: BillingCycle
): boolean {
  const targetPrice = getPlanPrice(plan, billingCycle)
  if (subscription.planPrice === 0 && targetPrice > 0) return true

  const currentCycle = normalizeBillingCycle(subscription.billingCycle)
  if (currentCycle !== billingCycle) return false

  return Boolean(
    subscription.startDate && subscription.endDate && targetPrice > subscription.planPrice
  )
}
