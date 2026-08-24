'use client'

import { useMemo, useState } from 'react'
import { logger } from '@/lib/logger'
import { CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import {
  CurrentPlanCard,
  PaymentHistoryTable,
  PlanCard,
  SubscriptionActionDialog,
  SubscriptionEmptyState,
  SubscriptionErrorState,
  SubscriptionPageSkeleton,
  TenantOwnerOnlyState,
} from '../components/SubscriptionPage'
import {
  useCancelSubscriptionMutation,
  useCurrentSubscriptionQuery,
  useInvoiceDownloadMutation,
  usePaymentHistoryQuery,
  useRenewSubscriptionMutation,
  useSubscriptionPlansQuery,
  useUpgradeSubscriptionMutation,
} from '../hooks/use-subscription'
import type {
  InvoiceActionState,
  PaymentHistoryFilterState,
  PaymentResponse,
  SubscriptionPlanResponse,
} from '../types/subscription.types'
import {
  buildInvoiceFileName,
  findCurrentPlan,
  formatCurrency,
  isActivePlan,
  isCompletedPayment,
  shouldShowRenewAction,
} from '../utils/format-subscription'
import { buildPaymentHistoryQuery, isInvalidPaymentDateRange } from '../utils/payment-history-query'
import { getPlanActionState } from '../utils/subscription-eligibility'

const PAYMENT_PAGE_SIZE = 10

const defaultPaymentFilters: PaymentHistoryFilterState = {
  searchText: '',
  planId: 'all',
  status: 'all',
}

type DialogState =
  | { readonly type: 'upgrade'; readonly plan: SubscriptionPlanResponse }
  | { readonly type: 'renew' }
  | { readonly type: 'cancel' }

export function SubscriptionPage() {
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner
  const [dialogState, setDialogState] = useState<DialogState | null>(null)
  const [paymentPageIndex, setPaymentPageIndex] = useState(0)
  const [paymentFilters, setPaymentFilters] =
    useState<PaymentHistoryFilterState>(defaultPaymentFilters)
  const [appliedPaymentFilters, setAppliedPaymentFilters] =
    useState<PaymentHistoryFilterState>(defaultPaymentFilters)
  const [dateRangeError, setDateRangeError] = useState<string>()
  const [invoiceActionState, setInvoiceActionState] = useState<InvoiceActionState | null>(null)

  const paymentQuery = useMemo(
    () => buildPaymentHistoryQuery(appliedPaymentFilters, paymentPageIndex, PAYMENT_PAGE_SIZE),
    [appliedPaymentFilters, paymentPageIndex]
  )

  const subscriptionQuery = useCurrentSubscriptionQuery(isTenantOwner)
  const plansQuery = useSubscriptionPlansQuery(isTenantOwner)
  const paymentsQuery = usePaymentHistoryQuery(paymentQuery, isTenantOwner)
  const upgradeMutation = useUpgradeSubscriptionMutation()
  const renewMutation = useRenewSubscriptionMutation()
  const cancelMutation = useCancelSubscriptionMutation()
  const invoiceDownloadMutation = useInvoiceDownloadMutation()

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

  const handleFiltersSubmit = () => {
    if (isInvalidPaymentDateRange(paymentFilters)) {
      setDateRangeError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.')
      return
    }

    setDateRangeError(undefined)
    setPaymentPageIndex(0)
    setAppliedPaymentFilters(paymentFilters)
  }

  const handleFiltersReset = () => {
    setDateRangeError(undefined)
    setPaymentPageIndex(0)
    setPaymentFilters(defaultPaymentFilters)
    setAppliedPaymentFilters(defaultPaymentFilters)
  }

  const handleDownloadInvoice = async (payment: PaymentResponse) => {
    if (!isCompletedPayment(payment.status)) return

    setInvoiceActionState({ paymentId: payment.id, kind: 'download' })
    try {
      const blob = await invoiceDownloadMutation.mutateAsync(payment.id)
      downloadBlob(blob, buildInvoiceFileName(payment.invoiceNumber))
    } catch {
      // The mutation handles fetch failures with a user-facing toast.
    } finally {
      setInvoiceActionState(null)
    }
  }

  const handlePrintInvoice = (payment: PaymentResponse) => {
    if (!isCompletedPayment(payment.status)) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      const error = new Error('Popup blocked')
      logger.error(error)
      toast.error('The print window was blocked. Please allow popups and try again.')
      return
    }

    try {
      printWindow.opener = null
    } catch (error) {
      logger.warn('Unable to clear print window opener.', error)
    }

    printWindow.location.replace(`/subscription/invoices/${payment.id}/print`)
  }

  const dialogCopy = getDialogCopy(dialogState, subscription?.planName)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="min-w-0">
          <h1 className="text-foreground text-xl font-semibold">Gói dịch vụ</h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Theo dõi gói hiện tại, nâng cấp khi cần thêm giới hạn và tải hóa đơn PDF cho đối soát.
          </p>
        </div>
      </div>

      {!subscription ? (
        <SubscriptionEmptyState
          title="Chưa có gói dịch vụ"
          description="Tenant hiện chưa có subscription active trong hệ thống."
        />
      ) : (
        <div className="flex min-w-0 flex-col gap-6">
          <CurrentPlanCard
            subscription={subscription}
            showRenewAction={showRenewAction}
            isRenewPending={renewMutation.isPending}
            isCancelPending={cancelMutation.isPending}
            onRenew={() => setDialogState({ type: 'renew' })}
            onCancel={() => setDialogState({ type: 'cancel' })}
          />

          <section className="flex min-w-0 flex-col gap-3" aria-labelledby="available-plans-title">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 id="available-plans-title" className="text-foreground text-base font-semibold">
                  Các gói có thể chọn
                </h2>
                <p className="text-muted-foreground text-sm">
                  Chỉ hiển thị plan đang active để tránh chọn nhầm gói đã ngưng kinh doanh.
                </p>
              </div>
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
                {activePlans.map((plan) => {
                  const planActionState = getPlanActionState(plan, currentPlan, isActionPending)

                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      actionState={planActionState}
                      onUpgrade={(selectedPlan) => {
                        if (planActionState.disabled) return
                        setDialogState({ type: 'upgrade', plan: selectedPlan })
                      }}
                    />
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <PaymentHistoryTable
        payments={payments}
        plans={activePlans}
        totalCount={totalPayments}
        pageIndex={paymentPageIndex}
        pageSize={PAYMENT_PAGE_SIZE}
        filters={paymentFilters}
        dateRangeError={dateRangeError}
        isLoading={paymentsQuery.isLoading || paymentsQuery.isFetching}
        isError={paymentsQuery.isError}
        invoiceActionState={invoiceActionState}
        onFiltersChange={setPaymentFilters}
        onFiltersSubmit={handleFiltersSubmit}
        onFiltersReset={handleFiltersReset}
        onPreviousPage={() => setPaymentPageIndex((page) => Math.max(0, page - 1))}
        onNextPage={() => setPaymentPageIndex((page) => page + 1)}
        onRetry={() => paymentsQuery.refetch()}
        onDownloadInvoice={handleDownloadInvoice}
        onPrintInvoice={handlePrintInvoice}
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
      description: `Chuyển từ ${currentPlanName ?? 'gói hiện tại'} sang ${dialogState.plan.planName} với giá ${formatCurrency(dialogState.plan.monthlyPrice)}/tháng.`,
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
