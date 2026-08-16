import { CalendarClock, CreditCard, RotateCcw, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { SubscriptionStatusResponse } from '../../types/subscription.types'
import {
  formatBillingCycle,
  formatCurrency,
  formatDate,
  isCancelledSubscription,
} from '../../utils/format-subscription'

interface CurrentPlanCardProps {
  readonly subscription: SubscriptionStatusResponse
  readonly showRenewAction: boolean
  readonly isRenewPending: boolean
  readonly isCancelPending: boolean
  readonly onRenew: () => void
  readonly onCancel: () => void
}

function getProgressValue(subscription: SubscriptionStatusResponse): number {
  const startDate = new Date(subscription.startDate)
  const endDate = new Date(subscription.endDate)
  const now = new Date()
  const totalDuration = endDate.getTime() - startDate.getTime()
  if (totalDuration <= 0) return subscription.isExpired ? 0 : 100

  const elapsedDuration = now.getTime() - startDate.getTime()
  const remaining = 100 - (elapsedDuration / totalDuration) * 100
  return Math.max(0, Math.min(100, remaining))
}

function CurrentStatusBadge({
  subscription,
}: {
  readonly subscription: SubscriptionStatusResponse
}) {
  if (subscription.isExpired) {
    return <Badge variant="destructive">Đã hết hạn</Badge>
  }

  if (isCancelledSubscription(subscription)) {
    return <Badge variant="outline">Đã hủy</Badge>
  }

  return <Badge>Đang hoạt động</Badge>
}

export function CurrentPlanCard({
  subscription,
  showRenewAction,
  isRenewPending,
  isCancelPending,
  onRenew,
  onCancel,
}: CurrentPlanCardProps) {
  const progressValue = getProgressValue(subscription)
  const cancelled = isCancelledSubscription(subscription)

  return (
    <Card className="border-primary/20 min-w-0">
      <CardHeader className="border-border/70 border-b">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
            <CreditCard className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-semibold">
              {subscription.planName}
            </CardTitle>
            <CardDescription>Gói hiện tại của tenant</CardDescription>
          </div>
        </div>
        <CardAction>
          <CurrentStatusBadge subscription={subscription} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {subscription.isExpired && (
          <Alert variant="destructive">
            <CalendarClock className="size-4" aria-hidden="true" />
            <AlertTitle>Gói dịch vụ đã hết hạn</AlertTitle>
            <AlertDescription>
              Gia hạn để khôi phục quyền ghi dữ liệu ngoài các luồng tài khoản và thanh toán.
            </AlertDescription>
          </Alert>
        )}

        {cancelled && (
          <Alert>
            <XCircle className="size-4" aria-hidden="true" />
            <AlertTitle>Gói đã bị hủy</AlertTitle>
            <AlertDescription>
              Gói đã hủy không thể gia hạn bằng luồng renew. Hãy chọn một gói mới nếu backend cho
              phép nâng cấp.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Metric label="Chi phí" value={formatCurrency(subscription.planPrice)} />
          <Metric label="Chu kỳ" value={formatBillingCycle(subscription.billingCycle)} />
          <Metric
            className="col-span-2 lg:col-span-1"
            label="Kết thúc"
            value={formatDate(subscription.endDate)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium">Thời hạn còn lại</p>
            <p
              className={cn('text-xs font-semibold', subscription.isExpired && 'text-destructive')}
            >
              {subscription.isExpired ? 'Đã hết hạn' : `Còn ${subscription.daysRemaining} ngày`}
            </p>
          </div>
          <Progress value={progressValue} aria-label="Thời hạn còn lại của gói dịch vụ" />
        </div>
      </CardContent>

      {!cancelled && (
        <CardFooter className="flex flex-col gap-2 border-t sm:flex-row sm:justify-end">
          {showRenewAction && (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isRenewPending}
              onClick={onRenew}
            >
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              {isRenewPending ? 'Đang gia hạn...' : 'Gia hạn'}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isCancelPending}
            onClick={onCancel}
          >
            Hủy gói
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

interface MetricProps {
  readonly className?: string
  readonly label: string
  readonly value: string
}

function Metric({ className, label, value }: MetricProps) {
  return (
    <div className={cn('border-border bg-muted/40 min-w-0 rounded-md border p-3', className)}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}
