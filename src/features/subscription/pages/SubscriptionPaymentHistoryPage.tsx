'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { USER_ROLES } from '@/config/roles'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { PaymentHistoryTable, TenantOwnerOnlyState } from '../components/SubscriptionPage'
import {
  useInvoiceDownloadMutation,
  usePaymentHistoryQuery,
  useSubscriptionPlansQuery,
} from '../hooks/use-subscription'
import type {
  InvoiceActionState,
  PaymentHistoryFilterState,
  PaymentResponse,
} from '../types/subscription.types'
import {
  buildInvoiceFileName,
  isActivePlan,
  isCompletedPayment,
} from '../utils/format-subscription'
import { buildPaymentHistoryQuery, isInvalidPaymentDateRange } from '../utils/payment-history-query'

const PAYMENT_PAGE_SIZE = 10

const defaultPaymentFilters: PaymentHistoryFilterState = {
  searchText: '',
  planId: 'all',
  status: 'all',
}

export function SubscriptionPaymentHistoryPage() {
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner
  const [pageIndex, setPageIndex] = useState(0)
  const [filters, setFilters] = useState<PaymentHistoryFilterState>(defaultPaymentFilters)
  const [appliedFilters, setAppliedFilters] =
    useState<PaymentHistoryFilterState>(defaultPaymentFilters)
  const [dateRangeError, setDateRangeError] = useState<string>()
  const [invoiceActionState, setInvoiceActionState] = useState<InvoiceActionState | null>(null)

  const paymentQuery = useMemo(
    () => buildPaymentHistoryQuery(appliedFilters, pageIndex, PAYMENT_PAGE_SIZE),
    [appliedFilters, pageIndex]
  )
  const plansQuery = useSubscriptionPlansQuery(isTenantOwner)
  const paymentsQuery = usePaymentHistoryQuery(paymentQuery, isTenantOwner)
  const invoiceDownloadMutation = useInvoiceDownloadMutation()

  if (!isTenantOwner) {
    return <TenantOwnerOnlyState />
  }

  const plans = (plansQuery.data ?? []).filter(isActivePlan)
  const payments = paymentsQuery.data?.items ?? []
  const totalCount = paymentsQuery.data?.totalCount ?? 0

  const handleFiltersSubmit = () => {
    if (isInvalidPaymentDateRange(filters)) {
      setDateRangeError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.')
      return
    }

    setDateRangeError(undefined)
    setPageIndex(0)
    setAppliedFilters(filters)
  }

  const handleFiltersReset = () => {
    setDateRangeError(undefined)
    setPageIndex(0)
    setFilters(defaultPaymentFilters)
    setAppliedFilters(defaultPaymentFilters)
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
      logger.error(new Error('Popup blocked'))
      toast.error('Cửa sổ in đã bị chặn. Vui lòng cho phép popup và thử lại.')
      return
    }

    try {
      printWindow.opener = null
    } catch (error) {
      logger.warn('Unable to clear print window opener.', error)
    }

    printWindow.location.replace(`${APP_ROUTES.subscriptionInvoices}/${payment.id}/print`)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex min-w-0 flex-col gap-1">
        <h1 className="text-foreground text-xl font-semibold">Lịch sử thanh toán</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Tra cứu giao dịch, theo dõi trạng thái và tải hóa đơn PDF khi cần đối soát.
        </p>
      </header>

      <PaymentHistoryTable
        payments={payments}
        plans={plans}
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={PAYMENT_PAGE_SIZE}
        filters={filters}
        dateRangeError={dateRangeError}
        isLoading={paymentsQuery.isLoading || paymentsQuery.isFetching}
        isError={paymentsQuery.isError}
        invoiceActionState={invoiceActionState}
        onFiltersChange={setFilters}
        onFiltersSubmit={handleFiltersSubmit}
        onFiltersReset={handleFiltersReset}
        onPreviousPage={() => setPageIndex((page) => Math.max(0, page - 1))}
        onNextPage={() => setPageIndex((page) => page + 1)}
        onRetry={() => paymentsQuery.refetch()}
        onDownloadInvoice={handleDownloadInvoice}
        onPrintInvoice={handlePrintInvoice}
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
