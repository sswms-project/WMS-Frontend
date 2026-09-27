import { CalendarClock, CreditCard, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { SubscriptionStatusResponse } from '../../types/subscription.types'
import {
  formatBillingCycle,
  formatCurrency,
  formatDate,
  formatSubscriptionStatus,
  hasPendingSubscriptionChange,
  isCancelledSubscription,
} from '../../utils/format-subscription'

interface CurrentPlanCardProps {
  readonly subscription: SubscriptionStatusResponse
  readonly showRenewAction: boolean
  readonly isRenewPending: boolean
  readonly onRenew: () => void
  readonly onContinuePayment: () => void
}

function getProgressValue(subscription: SubscriptionStatusResponse): number {
  if (!subscription.startDate || !subscription.endDate) return 100
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
  return <Badge>{formatSubscriptionStatus(subscription.status)}</Badge>
}

export function CurrentPlanCard({
  subscription,
  showRenewAction,
  isRenewPending,
  onRenew,
  onContinuePayment,
}: CurrentPlanCardProps) {
  const progressValue = getProgressValue(subscription)
  const cancelled = isCancelledSubscription(subscription)
  const hasPendingChange = hasPendingSubscriptionChange(subscription)
  const hasPendingPayment = subscription.pendingPaymentStatus === 'Pending'
  const hasPaidFutureTerm = subscription.pendingPaymentStatus === 'Completed'

  // Expired, cancelled, and pending-change are shown as mutually exclusive banners
  // (most severe first) so the page never states two contradictory things at once —
  // e.g. "already cancelled" next to "your change applies next cycle".
  const showExpiredAlert = subscription.isExpired && !hasPendingPayment
  const showPendingChangeAlert =
    !cancelled && hasPendingChange && (!subscription.isExpired || hasPendingPayment)

  return (
    <Card className="border-primary/20 min-w-0 gap-0 py-0">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-3 lg:w-64 lg:shrink-0">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
              <CreditCard className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-base font-semibold">{subscription.planName}</h2>
                <CurrentStatusBadge subscription={subscription} />
              </div>
              <p className="text-muted-foreground text-xs">Gói hiện tại của tổ chức</p>
            </div>
          </div>

          <dl className="border-border grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-3 border-y py-3 sm:grid-cols-3 lg:border-y-0 lg:border-l lg:py-0 lg:pl-5">
            <Metric
              label="Chi phí"
              value={formatCurrency(subscription.planPrice, subscription.currency)}
            />
            <Metric label="Chu kỳ" value={formatBillingCycle(subscription.billingCycle)} />
            <Metric
              className="col-span-2 sm:col-span-1"
              label="Kết thúc"
              value={subscription.endDate ? formatDate(subscription.endDate) : 'Không thời hạn'}
            />
            <Metric label="Suất người dùng" value={formatUserUsage(subscription)} />
            <Metric
              label="Kho đang dùng"
              value={formatUsage(subscription.currentWarehouseCount, subscription.warehouseLimit)}
            />
          </dl>

          {!cancelled && showRenewAction && (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={isRenewPending}
                onClick={onRenew}
              >
                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                {isRenewPending ? 'Đang gia hạn…' : 'Gia hạn thủ công'}
              </Button>
            </div>
          )}
        </div>

        {!subscription.isExpired && subscription.endDate && (
          <div className="flex min-w-0 items-center gap-3">
            <Progress
              className="h-1.5 flex-1"
              value={progressValue}
              aria-label="Thời hạn còn lại của gói dịch vụ"
            />
            <p className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums">
              Còn {subscription.daysRemaining} ngày
            </p>
          </div>
        )}

        {showExpiredAlert && (
          <Alert variant="destructive">
            <CalendarClock aria-hidden="true" />
            <AlertTitle>Gói dịch vụ đã hết hạn</AlertTitle>
            <AlertDescription>
              Gia hạn để khôi phục quyền ghi dữ liệu ngoài các luồng tài khoản và thanh toán.
            </AlertDescription>
          </Alert>
        )}

        {showPendingChangeAlert && (
          <Alert>
            <RotateCcw aria-hidden="true" />
            <AlertTitle>
              {hasPendingPayment
                ? 'Thanh toán gói dịch vụ đang chờ'
                : hasPaidFutureTerm
                  ? 'Đã thanh toán, đang chờ ngày áp dụng'
                  : 'Đã lên lịch chuyển gói'}
            </AlertTitle>
            <AlertDescription>
              {hasPendingPayment
                ? subscription.pendingPlanName &&
                  subscription.pendingPlanName !== subscription.planName
                  ? `Hoàn tất thanh toán để áp dụng gói ${subscription.pendingPlanName} (${formatBillingCycle(subscription.pendingBillingCycle || subscription.billingCycle)}).`
                  : `Hoàn tất thanh toán để gia hạn gói ${subscription.planName}.`
                : `${subscription.pendingPlanName || subscription.planName} (${formatBillingCycle(subscription.pendingBillingCycle || subscription.billingCycle)}) sẽ được áp dụng ${subscription.pendingEffectiveAt ? `từ ${formatDate(subscription.pendingEffectiveAt)}` : 'vào kỳ thanh toán kế tiếp'}.`}
              {hasPendingPayment && subscription.pendingCheckoutUrl ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 min-h-11 w-full sm:w-auto"
                  onClick={onContinuePayment}
                >
                  Tiếp tục thanh toán
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

function formatUsage(current: number, limit: number | null): string {
  return `${current}/${limit ?? 'Không giới hạn'}`
}

function formatUserUsage(subscription: SubscriptionStatusResponse): string {
  const pendingInvitations = subscription.pendingInvitationCount ?? 0
  const consumedSlots = subscription.currentUserCount + pendingInvitations
  const usage = formatUsage(consumedSlots, subscription.userLimit)
  return pendingInvitations > 0 ? `${usage} (${pendingInvitations} lời mời chờ)` : usage
}

interface MetricProps {
  readonly className?: string
  readonly label: string
  readonly value: string
}

function Metric({ className, label, value }: MetricProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums" title={value}>
        {value}
      </dd>
    </div>
  )
}
