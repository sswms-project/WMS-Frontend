import { Check, PackageCheck } from 'lucide-react'
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
import type { PlanActionState, SubscriptionPlanResponse } from '../../types/subscription.types'
import { formatCurrency, getFeatureRows } from '../../utils/format-subscription'

interface PlanCardProps {
  readonly plan: SubscriptionPlanResponse
  readonly actionState: PlanActionState
  readonly onUpgrade: (plan: SubscriptionPlanResponse) => void
}

export function PlanCard({ plan, actionState, onUpgrade }: PlanCardProps) {
  const isCurrentPlan = actionState.label === 'Đang sử dụng'

  return (
    <Card
      className={cn(
        'border-border min-w-0 transition-[border-color,background-color]',
        isCurrentPlan && 'border-primary/40 bg-primary/5'
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="bg-muted text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
            <PackageCheck className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-semibold">{plan.planName}</CardTitle>
            <CardDescription>
              {plan.yearlyDiscountPercent > 0
                ? `Tiết kiệm ${plan.yearlyDiscountPercent}% theo năm`
                : 'Thanh toán hàng tháng'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <p className="text-xl font-semibold tracking-tight tabular-nums">
            {plan.monthlyPrice === 0 ? 'Miễn phí' : formatCurrency(plan.monthlyPrice)}
          </p>
          <p className="text-muted-foreground text-xs">mỗi tháng</p>
        </div>
        <div className="flex flex-col gap-2">
          {getFeatureRows(plan).map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
                <Check className="text-primary size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{row.label}</span>
              </span>
              <span className="text-xs font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
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
