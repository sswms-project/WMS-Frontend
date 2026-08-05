import { Check, PackageCheck } from 'lucide-react'
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
import type { PlanActionState, SubscriptionPlanResponse } from '../../types/subscription.types'
import { formatBillingCycle, formatCurrency, getFeatureRows } from '../../utils/format-subscription'

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
        'border-border min-w-0 transition-colors',
        isCurrentPlan && 'border-primary bg-primary/5'
      )}
    >
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="bg-muted text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
            <PackageCheck className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-semibold">{plan.planName}</CardTitle>
            <CardDescription>{formatBillingCycle(plan.billingCycle)}</CardDescription>
          </div>
          {isCurrentPlan && <Badge>Hiện tại</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{formatCurrency(plan.price)}</p>
          <p className="text-muted-foreground text-xs">
            Giá theo {formatBillingCycle(plan.billingCycle).toLowerCase()}
          </p>
        </div>
        <div className="grid gap-2">
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
