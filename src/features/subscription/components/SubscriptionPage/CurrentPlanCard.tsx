import { CalendarClock, CreditCard, RotateCcw, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type {
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
} from '../../types/subscription.types'
import {
  formatBillingCycle,
  formatCurrency,
  formatDate,
  formatSubscriptionStatus,
  getFeatureRows,
  isCancelledSubscription,
} from '../../utils/format-subscription'

interface CurrentPlanCardProps {
  readonly subscription: SubscriptionStatusResponse
  readonly plan?: SubscriptionPlanResponse
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
  plan,
  showRenewAction,
  isRenewPending,
  isCancelPending,
  onRenew,
  onCancel,
}: CurrentPlanCardProps) {
  const progressValue = getProgressValue(subscription)
  const featureRows = getFeatureRows(plan)
  const cancelled = isCancelledSubscription(subscription)

  return (
    <Card className="border-border min-w-0">
      <CardHeader className="border-b">
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

      <CardContent className="space-y-4">
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

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Metric label="Chi phí" value={formatCurrency(subscription.planPrice)} />
          <Metric label="Chu kỳ" value={formatBillingCycle(subscription.billingCycle)} />
          <Metric label="Bắt đầu" value={formatDate(subscription.startDate)} />
          <Metric label="Kết thúc" value={formatDate(subscription.endDate)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium">Thời hạn còn lại</p>
            <p
              className={cn('text-xs font-semibold', subscription.isExpired && 'text-destructive')}
            >
              {subscription.isExpired ? '0 ngày' : `${subscription.daysRemaining} ngày`}
            </p>
          </div>
          <Progress value={progressValue} aria-label="Thời hạn còn lại của gói dịch vụ" />
          <p className="text-muted-foreground text-xs">
            Trạng thái backend: {formatSubscriptionStatus(subscription.status)}
          </p>
        </div>

        {featureRows.length > 0 && (
          <>
            <Separator />
            <div className="grid gap-2">
              {featureRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground text-xs">{row.label}</span>
                  <span className="text-xs font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
          {showRenewAction && (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isRenewPending}
              onClick={onRenew}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {isRenewPending ? 'Đang gia hạn...' : 'Gia hạn'}
            </Button>
          )}
          {!cancelled && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isCancelPending}
              onClick={onCancel}
            >
              Hủy gói
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="border-border bg-muted/40 min-w-0 rounded-md border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}
