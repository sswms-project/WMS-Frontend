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
import { cn } from '@/lib/utils'
import type { SubscriptionPlanResponse } from '../../types/subscription.types'
import { formatBillingCycle, formatCurrency, getFeatureRows } from '../../utils/format-subscription'

interface PlanCardProps {
  readonly plan: SubscriptionPlanResponse
  readonly current: boolean
  readonly disabled: boolean
  readonly onUpgrade: (plan: SubscriptionPlanResponse) => void
}

export function PlanCard({ plan, current, disabled, onUpgrade }: PlanCardProps) {
  return (
    <Card
      className={cn(
        'border-border min-w-0 transition-colors',
        current && 'border-primary bg-primary/5'
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
          {current && <Badge>Hiện tại</Badge>}
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
        <Button
          type="button"
          variant={current ? 'outline' : 'default'}
          className="w-full"
          disabled={current || disabled}
          onClick={() => onUpgrade(plan)}
        >
          {current ? 'Đang sử dụng' : 'Nâng cấp'}
        </Button>
      </CardFooter>
    </Card>
  )
}
