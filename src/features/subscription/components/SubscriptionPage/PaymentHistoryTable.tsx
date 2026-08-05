import { ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
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
  const hasPrevious = pageIndex > 0
  const hasNext = (pageIndex + 1) * pageSize < totalCount

  return (
    <Card className="border-border min-w-0">
      <CardHeader className="gap-3 border-b sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold">Lịch sử thanh toán</CardTitle>
          <CardDescription>Tra cứu hóa đơn và tải PDF khi cần đối soát.</CardDescription>
        </div>
        <PaymentHistoryFilters
          plans={plans}
          value={filters}
          dateRangeError={dateRangeError}
          onChange={onFiltersChange}
          onSubmit={onFiltersSubmit}
          onReset={onFiltersReset}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
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
          <div className="min-w-0 overflow-x-auto">
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
                    <TableCell className="text-right font-medium">
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
                          label="PDF"
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
                          label="In"
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
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
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
              <ChevronLeft className="size-3.5" aria-hidden="true" />
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
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface InvoiceActionButtonProps {
  readonly label: string
  readonly icon: 'download' | 'print'
  readonly disabled: boolean
  readonly pending: boolean
  readonly tooltip?: string
  readonly onClick: () => void
}

function InvoiceActionButton({
  label,
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
      size="sm"
      disabled={disabled || pending}
      onClick={onClick}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {pending ? 'Đang xử lý...' : label}
    </Button>
  )
  if (!tooltip) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{button}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
