import { PackageCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { PlanFeatureSummary } from '../PlanFeatureSummary'
import type {
  BillingCycle,
  PlanActionState,
  SubscriptionPlanResponse,
} from '../../types/subscription.types'
import {
  formatCurrency,
  getBillingPeriodLabel,
  getMonthlyEquivalent,
  getPlanPrice,
} from '../../utils/format-subscription'

interface PlanCardProps {
  readonly plan: SubscriptionPlanResponse
  readonly billingCycle: BillingCycle
  readonly actionState: PlanActionState
  readonly onUpgrade: (plan: SubscriptionPlanResponse) => void
}

export function PlanCard({ plan, billingCycle, actionState, onUpgrade }: PlanCardProps) {
  const isCurrentPlan = actionState.label === 'Đang sử dụng'
  const planPrice = getPlanPrice(plan, billingCycle)
  const monthlyEquivalent = getMonthlyEquivalent(plan, billingCycle)

  return (
    <Card
      className={cn(
        'border-border flex h-full min-w-0 flex-col gap-0 py-0 transition-[border-color,background-color]',
        isCurrentPlan && 'border-primary/40 bg-primary/5'
      )}
    >
      <CardHeader className="gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-muted text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
            <PackageCheck className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-semibold">{plan.planName}</CardTitle>
            <CardDescription>{plan.features.length} quyền lợi được cấu hình</CardDescription>
          </div>
          {billingCycle === 'Yearly' && plan.yearlyDiscountPercent > 0 && (
            <Badge variant="secondary">Tiết kiệm {plan.yearlyDiscountPercent}%</Badge>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="min-w-0 text-xl font-semibold [overflow-wrap:anywhere] tabular-nums">
            {planPrice === 0 ? 'Miễn phí' : formatCurrency(planPrice)}
          </p>
          {planPrice > 0 && (
            <p className="text-muted-foreground text-xs">{getBillingPeriodLabel(billingCycle)}</p>
          )}
        </div>
        {billingCycle === 'Yearly' && planPrice > 0 && (
          <p className="text-muted-foreground text-xs tabular-nums">
            Tương đương {formatCurrency(monthlyEquivalent)}/tháng
          </p>
        )}
      </CardHeader>
      <CardContent className="border-border/70 flex-1 border-t p-4">
        <PlanFeatureSummary plan={plan} />
      </CardContent>
      <CardFooter className="p-4 pt-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full">
              <Button
                type="button"
                variant={isCurrentPlan ? 'outline' : 'default'}
                className="w-full"
                disabled={actionState.disabled}
                onClick={() => onUpgrade(plan)}
              >
                {actionState.label}
              </Button>
            </span>
          </TooltipTrigger>
          {actionState.tooltip && <TooltipContent>{actionState.tooltip}</TooltipContent>}
        </Tooltip>
      </CardFooter>
    </Card>
  )
}
