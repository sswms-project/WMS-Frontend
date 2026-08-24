'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, ListFilter, Printer, Search } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type {
  InvoiceActionState,
  PaymentHistoryFilterState,
  PaymentResponse,
  SubscriptionPlanResponse,
} from '../../types/subscription.types'
import {
  formatCurrency,
  formatDate,
  formatHistoricalPlanName,
  formatPaymentStatus,
  isCompletedPayment,
} from '../../utils/format-subscription'
import { PaymentHistoryFilters } from './PaymentHistoryFilters'

interface PaymentHistoryTableProps {
  readonly payments: readonly PaymentResponse[]
  readonly plans: readonly SubscriptionPlanResponse[]
  readonly totalCount: number
  readonly pageIndex: number
  readonly pageSize: number
  readonly filters: PaymentHistoryFilterState
  readonly dateRangeError?: string
  readonly isLoading: boolean
  readonly isError: boolean
  readonly invoiceActionState: InvoiceActionState | null
  readonly onFiltersChange: (filters: PaymentHistoryFilterState) => void
  readonly onFiltersSubmit: () => void
  readonly onFiltersReset: () => void
  readonly onPreviousPage: () => void
  readonly onNextPage: () => void
  readonly onRetry: () => void
  readonly onDownloadInvoice: (payment: PaymentResponse) => void
  readonly onPrintInvoice: (payment: PaymentResponse) => void
}

export function PaymentHistoryTable({
  payments,
  plans,
  totalCount,
  pageIndex,
  pageSize,
  filters,
  dateRangeError,
  isLoading,
  isError,
  invoiceActionState,
  onFiltersChange,
  onFiltersSubmit,
  onFiltersReset,
  onPreviousPage,
  onNextPage,
  onRetry,
  onDownloadInvoice,
  onPrintInvoice,
}: PaymentHistoryTableProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const hasPrevious = pageIndex > 0
  const hasNext = (pageIndex + 1) * pageSize < totalCount

  return (
    <Card className="border-border min-w-0">
      <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold">Danh sách giao dịch</CardTitle>
          <CardDescription>Tra cứu trạng thái và tải hóa đơn PDF khi cần đối soát.</CardDescription>
        </div>

        <form
          className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            onFiltersSubmit()
          }}
        >
          <InputGroup className="sm:w-64">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="payment-toolbar-search"
              name="paymentToolbarSearch"
              autoComplete="off"
              aria-label="Tìm theo mã hóa đơn"
              placeholder="Tìm mã hóa đơn…"
              value={filters.searchText}
              onChange={(event) => onFiltersChange({ ...filters, searchText: event.target.value })}
            />
          </InputGroup>
          <Button type="button" variant="outline" onClick={() => setIsFilterSheetOpen(true)}>
            <ListFilter data-icon="inline-start" aria-hidden="true" />
            Bộ lọc
          </Button>
        </form>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTitle>Không thể tải lịch sử thanh toán</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Vui lòng kiểm tra kết nối hoặc thử lại sau ít phút.</span>
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Tải lại
              </Button>
            </AlertDescription>
          </Alert>
        ) : payments.length === 0 ? (
          <Empty className="border-border bg-muted/30 min-h-48 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Download aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Chưa có thanh toán</EmptyTitle>
              <EmptyDescription>
                Các hóa đơn sẽ xuất hiện sau khi tenant nâng cấp hoặc gia hạn gói dịch vụ.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <PaymentHistoryMobileList
              payments={payments}
              invoiceActionState={invoiceActionState}
              onDownloadInvoice={onDownloadInvoice}
              onPrintInvoice={onPrintInvoice}
            />
            <PaymentHistoryDesktopTable
              payments={payments}
              invoiceActionState={invoiceActionState}
              onDownloadInvoice={onDownloadInvoice}
              onPrintInvoice={onPrintInvoice}
            />
          </>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs tabular-nums">
            {totalCount > 0
              ? `Hiển thị ${pageIndex * pageSize + 1}-${Math.min((pageIndex + 1) * pageSize, totalCount)} trong ${totalCount} hóa đơn`
              : 'Không có hóa đơn'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPrevious}
              onClick={onPreviousPage}
            >
              <ChevronLeft data-icon="inline-start" aria-hidden="true" />
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={onNextPage}
            >
              Sau
              <ChevronRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Bộ lọc thanh toán</SheetTitle>
            <SheetDescription>
              Lọc hóa đơn theo gói, trạng thái hoặc khoảng thời gian.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <PaymentHistoryFilters
              plans={plans}
              value={filters}
              dateRangeError={dateRangeError}
              onChange={onFiltersChange}
              onSubmit={onFiltersSubmit}
              onReset={onFiltersReset}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  )
}

interface PaymentHistoryListProps {
  readonly payments: readonly PaymentResponse[]
  readonly invoiceActionState: InvoiceActionState | null
  readonly onDownloadInvoice: (payment: PaymentResponse) => void
  readonly onPrintInvoice: (payment: PaymentResponse) => void
}

function PaymentHistoryMobileList({
  payments,
  invoiceActionState,
  onDownloadInvoice,
  onPrintInvoice,
}: PaymentHistoryListProps) {
  return (
    <div className="flex flex-col md:hidden">
      {payments.map((payment) => (
        <article
          key={payment.id}
          className="flex flex-col gap-3 border-b py-3 first:pt-0 last:border-b-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-sm font-medium">{payment.invoiceNumber}</p>
              <p className="text-muted-foreground truncate text-xs">
                {formatHistoricalPlanName(payment.planName)}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium">
              {formatPaymentStatus(payment.status)}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Số tiền</dt>
              <dd className="font-medium tabular-nums">{formatCurrency(payment.amount)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Thanh toán</dt>
              <dd>{payment.paidAt ? formatDate(payment.paidAt) : 'Chưa thanh toán'}</dd>
            </div>
          </dl>
          <div className="flex justify-end gap-2">
            <InvoiceActionButton
              ariaLabel={`Tải hóa đơn ${payment.invoiceNumber}`}
              icon="download"
              disabled={!isCompletedPayment(payment.status)}
              pending={
                invoiceActionState?.paymentId === payment.id &&
                invoiceActionState.kind === 'download'
              }
              tooltip={
                !isCompletedPayment(payment.status)
                  ? 'Chỉ có hóa đơn khi thanh toán hoàn tất'
                  : undefined
              }
              onClick={() => onDownloadInvoice(payment)}
            />
            <InvoiceActionButton
              ariaLabel={`In hóa đơn ${payment.invoiceNumber}`}
              icon="print"
              disabled={!isCompletedPayment(payment.status)}
              pending={
                invoiceActionState?.paymentId === payment.id && invoiceActionState.kind === 'print'
              }
              tooltip={
                !isCompletedPayment(payment.status)
                  ? 'Chỉ có hóa đơn khi thanh toán hoàn tất'
                  : undefined
              }
              onClick={() => onPrintInvoice(payment)}
            />
          </div>
        </article>
      ))}
    </div>
  )
}

function PaymentHistoryDesktopTable({
  payments,
  invoiceActionState,
  onDownloadInvoice,
  onPrintInvoice,
}: PaymentHistoryListProps) {
  return (
    <div className="hidden min-w-0 overflow-x-auto md:block">
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow>
            <TableHead>Mã hóa đơn</TableHead>
            <TableHead>Gói dịch vụ</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày thanh toán</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono">{payment.invoiceNumber}</TableCell>
              <TableCell>{formatHistoricalPlanName(payment.planName)}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>{formatPaymentStatus(payment.status)}</TableCell>
              <TableCell>
                {payment.paidAt ? formatDate(payment.paidAt) : 'Chưa thanh toán'}
              </TableCell>
              <TableCell>{formatDate(payment.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <InvoiceActionButton
                    ariaLabel={`Tải hóa đơn ${payment.invoiceNumber}`}
                    icon="download"
                    disabled={!isCompletedPayment(payment.status)}
                    pending={
                      invoiceActionState?.paymentId === payment.id &&
                      invoiceActionState.kind === 'download'
                    }
                    tooltip={
                      !isCompletedPayment(payment.status)
                        ? 'Chỉ có hóa đơn khi thanh toán hoàn tất'
                        : undefined
                    }
                    onClick={() => onDownloadInvoice(payment)}
                  />
                  <InvoiceActionButton
                    ariaLabel={`In hóa đơn ${payment.invoiceNumber}`}
                    icon="print"
                    disabled={!isCompletedPayment(payment.status)}
                    pending={
                      invoiceActionState?.paymentId === payment.id &&
                      invoiceActionState.kind === 'print'
                    }
                    tooltip={
                      !isCompletedPayment(payment.status)
                        ? 'Chỉ có hóa đơn khi thanh toán hoàn tất'
                        : undefined
                    }
                    onClick={() => onPrintInvoice(payment)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface InvoiceActionButtonProps {
  readonly ariaLabel: string
  readonly icon: 'download' | 'print'
  readonly disabled: boolean
  readonly pending: boolean
  readonly tooltip?: string
  readonly onClick: () => void
}

function InvoiceActionButton({
  ariaLabel,
  icon,
  disabled,
  pending,
  tooltip,
  onClick,
}: InvoiceActionButtonProps) {
  const Icon = icon === 'download' ? Download : Printer
  const button = (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={ariaLabel}
      disabled={disabled || pending}
      onClick={onClick}
    >
      <Icon
        aria-hidden="true"
        className={pending ? 'animate-spin motion-reduce:animate-none' : undefined}
      />
    </Button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{button}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? ariaLabel}</TooltipContent>
    </Tooltip>
  )
}
