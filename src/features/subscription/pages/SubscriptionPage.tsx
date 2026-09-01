'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import { BillingCycleToggle } from '../components/BillingCycleToggle'
import {
  CurrentPlanCard,
  PlanCard,
  SubscriptionActionDialog,
  SubscriptionEmptyState,
  SubscriptionErrorState,
  SubscriptionPageSkeleton,
  TenantOwnerOnlyState,
} from '../components/SubscriptionPage'
import {
  useCancelSubscriptionMutation,
  useCreatePaymentLinkMutation,
  useCurrentSubscriptionQuery,
  useRenewSubscriptionMutation,
  useSubscriptionPlansQuery,
  useUpgradeSubscriptionMutation,
} from '../hooks/use-subscription'
import type {
  BillingCycle,
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
} from '../types/subscription.types'
import {
  findCurrentPlan,
  formatBillingCycle,
  formatCurrency,
  getBillingPeriodLabel,
  getPlanPrice,
  isActivePlan,
  normalizeBillingCycle,
  shouldShowRenewAction,
} from '../utils/format-subscription'
import { getPlanActionState } from '../utils/subscription-eligibility'

type DialogState =
  | {
      readonly type: 'upgrade'
      readonly plan: SubscriptionPlanResponse
      readonly billingCycle: BillingCycle
    }
  | { readonly type: 'renew' }
  | { readonly type: 'cancel' }

export function SubscriptionPage() {
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner
  const [dialogState, setDialogState] = useState<DialogState | null>(null)
  const [billingCycleOverride, setBillingCycleOverride] = useState<BillingCycle>()

  const subscriptionQuery = useCurrentSubscriptionQuery(isTenantOwner)
  const plansQuery = useSubscriptionPlansQuery(isTenantOwner)
  const upgradeMutation = useUpgradeSubscriptionMutation()
  const renewMutation = useRenewSubscriptionMutation()
  const cancelMutation = useCancelSubscriptionMutation()
  const createPaymentLinkMutation = useCreatePaymentLinkMutation()

  if (!isTenantOwner) {
    return <TenantOwnerOnlyState />
  }

  if (subscriptionQuery.isLoading || plansQuery.isLoading) {
    return <SubscriptionPageSkeleton />
  }

  if (subscriptionQuery.isError || plansQuery.isError) {
    return (
      <SubscriptionErrorState
        onRetry={() => {
          subscriptionQuery.refetch()
          plansQuery.refetch()
        }}
      />
    )
  }

  const subscription = subscriptionQuery.data
  const plans = plansQuery.data ?? []
  const activePlans = plans.filter(isActivePlan).toSorted((firstPlan, secondPlan) => {
    if (firstPlan.displayOrder !== secondPlan.displayOrder) {
      return firstPlan.displayOrder - secondPlan.displayOrder
    }
    return firstPlan.monthlyPrice - secondPlan.monthlyPrice
  })
  const currentPlan = findCurrentPlan(subscription, plans)
  const selectedBillingCycle =
    billingCycleOverride ?? normalizeBillingCycle(subscription?.billingCycle)
  const maximumYearlySaving = activePlans.reduce(
    (maximum, plan) => Math.max(maximum, plan.yearlyDiscountPercent),
    0
  )
  const showRenewAction = shouldShowRenewAction(subscription)
  const isActionPending =
    upgradeMutation.isPending ||
    renewMutation.isPending ||
    cancelMutation.isPending ||
    createPaymentLinkMutation.isPending

  const handleConfirmDialog = async () => {
    if (!dialogState) return

    try {
      if (dialogState.type === 'upgrade') {
        // Creates pending payment + redirects to PayOS checkout
        await createPaymentLinkMutation.mutateAsync({
          newPlanId: dialogState.plan.id,
          billingCycle: dialogState.billingCycle,
        })
        setDialogState(null)
        return
      }

      if (dialogState.type === 'renew') {
        await renewMutation.mutateAsync()
        setDialogState(null)
        return
      }

      await cancelMutation.mutateAsync()
      setDialogState(null)
    } catch {
      // Mutation hooks already log and show a toast.
    }
  }

  const dialogCopy = getDialogCopy(dialogState, subscription)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 lg:gap-5">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="min-w-0">
          <h1 className="text-foreground text-xl font-semibold">Gói dịch vụ</h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Theo dõi gói hiện tại, điều chỉnh chu kỳ và nâng cấp khi cần thêm giới hạn.
          </p>
        </div>
      </div>

      {!subscription ? (
        <SubscriptionEmptyState
          title="Chưa có gói dịch vụ"
          description="Tenant hiện chưa có subscription active trong hệ thống."
        />
      ) : (
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <CurrentPlanCard
            subscription={subscription}
            showRenewAction={showRenewAction}
            isRenewPending={renewMutation.isPending}
            isCancelPending={cancelMutation.isPending}
            onRenew={() => setDialogState({ type: 'renew' })}
            onCancel={() => setDialogState({ type: 'cancel' })}
          />

          <section className="flex min-w-0 flex-col gap-3" aria-labelledby="available-plans-title">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 id="available-plans-title" className="text-foreground text-base font-semibold">
                  Các gói có thể chọn
                </h2>
                <p className="text-muted-foreground text-sm">
                  Chỉ hiển thị plan đang active để tránh chọn nhầm gói đã ngưng kinh doanh.
                </p>
              </div>
              <BillingCycleToggle
                value={selectedBillingCycle}
                yearlySavingPercent={maximumYearlySaving}
                onValueChange={setBillingCycleOverride}
              />
            </div>

            {activePlans.length === 0 ? (
              <Empty className="border-border bg-card min-h-64 border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CreditCard aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có plan active</EmptyTitle>
                  <EmptyDescription>
                    Backend chưa trả về gói dịch vụ active cho tenant owner.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid min-w-0 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {activePlans.map((plan) => {
                  const planActionState = getPlanActionState(
                    plan,
                    currentPlan,
                    subscription,
                    selectedBillingCycle,
                    isActionPending
                  )

                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      billingCycle={selectedBillingCycle}
                      actionState={planActionState}
                      onUpgrade={(selectedPlan) => {
                        if (planActionState.disabled) return
                        setDialogState({
                          type: 'upgrade',
                          plan: selectedPlan,
                          billingCycle: selectedBillingCycle,
                        })
                      }}
                    />
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <SubscriptionActionDialog
        open={dialogState !== null}
        title={dialogCopy.title}
        description={dialogCopy.description}
        confirmLabel={dialogCopy.confirmLabel}
        variant={dialogState?.type === 'cancel' ? 'destructive' : 'default'}
        isPending={isActionPending}
        onOpenChange={(open) => {
          if (!open && !isActionPending) setDialogState(null)
        }}
        onConfirm={handleConfirmDialog}
      />
    </div>
  )
}

function getDialogCopy(dialogState: DialogState | null, subscription?: SubscriptionStatusResponse) {
  if (!dialogState) {
    return {
      title: '',
      description: '',
      confirmLabel: '',
    }
  }

  if (dialogState.type === 'upgrade') {
    const selectedPrice = getPlanPrice(dialogState.plan, dialogState.billingCycle)
    const isScheduledChange = subscription !== undefined && selectedPrice <= subscription.planPrice

    return {
      title: isScheduledChange ? 'Xác nhận chuyển gói' : 'Xác nhận nâng cấp gói',
      description: isScheduledChange
        ? `${dialogState.plan.planName} (${formatBillingCycle(dialogState.billingCycle)}) sẽ được áp dụng từ kỳ thanh toán kế tiếp với giá ${formatCurrency(selectedPrice)} ${getBillingPeriodLabel(dialogState.billingCycle)}.`
        : `Chuyển từ ${subscription?.planName ?? 'gói hiện tại'} sang ${dialogState.plan.planName} với giá ${formatCurrency(selectedPrice)} ${getBillingPeriodLabel(dialogState.billingCycle)}.`,
      confirmLabel: isScheduledChange ? 'Xác nhận chuyển' : 'Nâng cấp',
    }
  }

  if (dialogState.type === 'renew') {
    return {
      title: 'Gia hạn gói dịch vụ',
      description: `Gia hạn ${subscription?.planName ?? 'gói hiện tại'} để tiếp tục sử dụng các quyền ghi dữ liệu của tenant.`,
      confirmLabel: 'Gia hạn',
    }
  }

  return {
    title: 'Hủy gói dịch vụ',
    description:
      'Sau khi hủy, tenant có thể mất quyền gia hạn bằng luồng hiện tại và cần chọn lại gói phù hợp nếu muốn tiếp tục sử dụng.',
    confirmLabel: 'Hủy gói',
  }
}
