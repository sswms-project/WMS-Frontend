'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CreditCard, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { USER_ROLES } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { OrderType, type QueryInfo } from '@/types/api'
import {
  CurrentPlanCard,
  PaymentHistoryTable,
  PlanCard,
  SubscriptionActionDialog,
  SubscriptionEmptyState,
  SubscriptionErrorState,
  SubscriptionPageSkeleton,
} from '../components/SubscriptionPage'
import {
  useCancelSubscriptionMutation,
  useCurrentSubscriptionQuery,
  useDownloadInvoiceMutation,
  usePaymentHistoryQuery,
  useRenewSubscriptionMutation,
  useSubscriptionPlansQuery,
  useUpgradeSubscriptionMutation,
} from '../hooks/use-subscription'
import type { PaymentResponse, SubscriptionPlanResponse } from '../types/subscription.types'
import {
  buildInvoiceFileName,
  findCurrentPlan,
  formatBillingCycle,
  formatCurrency,
  formatSubscriptionStatus,
  isActivePlan,
  shouldShowRenewAction,
} from '../utils/format-subscription'

const PAYMENT_PAGE_SIZE = 10

type DialogState =
  | { readonly type: 'upgrade'; readonly plan: SubscriptionPlanResponse }
  | { readonly type: 'renew' }
  | { readonly type: 'cancel' }

export function SubscriptionPage() {
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner
  const [dialogState, setDialogState] = useState<DialogState | null>(null)
  const [paymentPageIndex, setPaymentPageIndex] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [appliedSearchText, setAppliedSearchText] = useState('')

  const paymentQuery = useMemo<QueryInfo>(
    () => ({
      top: PAYMENT_PAGE_SIZE,
      skip: paymentPageIndex * PAYMENT_PAGE_SIZE,
      searchText: appliedSearchText || undefined,
      needTotalCount: true,
      orderBy: 'createdAt',
      orderType: OrderType.Descending,
    }),
    [appliedSearchText, paymentPageIndex]
  )

  const subscriptionQuery = useCurrentSubscriptionQuery(isTenantOwner)
  const plansQuery = useSubscriptionPlansQuery(isTenantOwner)
  const paymentsQuery = usePaymentHistoryQuery(paymentQuery, isTenantOwner)
  const upgradeMutation = useUpgradeSubscriptionMutation()
  const renewMutation = useRenewSubscriptionMutation()
  const cancelMutation = useCancelSubscriptionMutation()
  const downloadInvoiceMutation = useDownloadInvoiceMutation()

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
  const activePlans = plans.filter(isActivePlan)
  const currentPlan = findCurrentPlan(subscription, plans)
  const paymentHistory = paymentsQuery.data
  const payments = paymentHistory?.items ?? []
  const totalPayments = paymentHistory?.totalCount ?? 0
  const showRenewAction = shouldShowRenewAction(subscription)
  const isActionPending =
    upgradeMutation.isPending || renewMutation.isPending || cancelMutation.isPending

  const handleConfirmDialog = async () => {
    if (!dialogState) return

    try {
      if (dialogState.type === 'upgrade') {
        await upgradeMutation.mutateAsync({ newPlanId: dialogState.plan.id })
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

  const handleSearchSubmit = () => {
    setPaymentPageIndex(0)
    setAppliedSearchText(searchText.trim())
  }

  const handleDownloadInvoice = async (payment: PaymentResponse) => {
    try {
      const invoice = await downloadInvoiceMutation.mutateAsync({
        paymentId: payment.id,
        fallbackFileName: buildInvoiceFileName(payment.invoiceNumber),
      })
      downloadBlob(invoice.blob, invoice.fileName)
    } catch {
      // Mutation hook already logs and shows a toast.
    }
  }

  const dialogCopy = getDialogCopy(dialogState, subscription?.planName)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Badge variant="outline">Tenant billing</Badge>
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">Gói dịch vụ</h2>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Theo dõi gói hiện tại, nâng cấp khi cần thêm giới hạn và tải hóa đơn PDF cho đối soát.
          </p>
        </div>

        {subscription && (
          <Badge className="w-fit shrink-0">{formatSubscriptionStatus(subscription.status)}</Badge>
        )}
      </div>

      {!subscription ? (
        <SubscriptionEmptyState
          title="Chưa có gói dịch vụ"
          description="Tenant hiện chưa có subscription active trong hệ thống."
        />
      ) : (
        <div className="grid min-w-0 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <CurrentPlanCard
            subscription={subscription}
            plan={currentPlan}
            showRenewAction={showRenewAction}
            isRenewPending={renewMutation.isPending}
            isCancelPending={cancelMutation.isPending}
            onRenew={() => setDialogState({ type: 'renew' })}
            onCancel={() => setDialogState({ type: 'cancel' })}
          />

          <section className="min-w-0 space-y-3">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-foreground text-base font-semibold">Các gói có thể chọn</h3>
                <p className="text-muted-foreground text-sm">
                  Chỉ hiển thị plan đang active để tránh chọn nhầm gói đã ngưng kinh doanh.
                </p>
              </div>
              {currentPlan && (
                <p className="text-muted-foreground text-xs">
                  Gói hiện tại:{' '}
                  <span className="text-foreground font-medium">{currentPlan.planName}</span>
                </p>
              )}
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
              <div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {activePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    current={plan.planName === subscription.planName}
                    disabled={isActionPending}
                    onUpgrade={(selectedPlan) =>
                      setDialogState({ type: 'upgrade', plan: selectedPlan })
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {subscription?.isExpired && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle>Subscription đã hết hạn</AlertTitle>
          <AlertDescription>
            Một số thao tác ghi dữ liệu có thể bị backend chặn cho đến khi tenant gia hạn thành
            công.
          </AlertDescription>
        </Alert>
      )}

      <PaymentHistoryTable
        payments={payments}
        totalCount={totalPayments}
        pageIndex={paymentPageIndex}
        pageSize={PAYMENT_PAGE_SIZE}
        searchText={searchText}
        isLoading={paymentsQuery.isLoading || paymentsQuery.isFetching}
        isError={paymentsQuery.isError}
        isDownloading={downloadInvoiceMutation.isPending}
        onSearchTextChange={setSearchText}
        onSearchSubmit={handleSearchSubmit}
        onPreviousPage={() => setPaymentPageIndex((page) => Math.max(0, page - 1))}
        onNextPage={() => setPaymentPageIndex((page) => page + 1)}
        onRetry={() => paymentsQuery.refetch()}
        onDownloadInvoice={handleDownloadInvoice}
      />

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

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function TenantOwnerOnlyState() {
  return (
    <Card className="border-border mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Chỉ TenantOwner được truy cập</CardTitle>
        <CardDescription>
          Trang gói dịch vụ chứa thông tin billing của tenant nên không mở cho role hiện tại.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href={APP_ROUTES.dashboard}>Quay lại dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function getDialogCopy(dialogState: DialogState | null, currentPlanName?: string) {
  if (!dialogState) {
    return {
      title: '',
      description: '',
      confirmLabel: '',
    }
  }

  if (dialogState.type === 'upgrade') {
    return {
      title: 'Xác nhận nâng cấp gói',
      description: `Chuyển từ ${currentPlanName ?? 'gói hiện tại'} sang ${dialogState.plan.planName} với giá ${formatCurrency(dialogState.plan.price)} theo ${formatBillingCycle(dialogState.plan.billingCycle).toLowerCase()}.`,
      confirmLabel: 'Nâng cấp',
    }
  }

  if (dialogState.type === 'renew') {
    return {
      title: 'Gia hạn gói dịch vụ',
      description: `Gia hạn ${currentPlanName ?? 'gói hiện tại'} để tiếp tục sử dụng các quyền ghi dữ liệu của tenant.`,
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
