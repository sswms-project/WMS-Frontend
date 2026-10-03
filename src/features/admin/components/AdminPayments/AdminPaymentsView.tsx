import { Receipt, RefreshCw, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { cn } from '@/lib/utils'
import {
  formatPaymentStatus,
  isCompletedPayment,
} from '@/features/subscription/utils/format-subscription'
import {
  formatAdminCurrency,
  formatAdminDateTime,
  formatPaymentType,
} from '../../utils/platform-admin-format'
import type { AdminPaymentResponse, SubscriptionPlanResponse } from '../../types/admin.types'

const ALL = 'all'
const STATUS_OPTIONS = ['Completed', 'Pending', 'Failed'] as const

interface AdminPaymentsViewProps {
  readonly items: readonly AdminPaymentResponse[]
  readonly plans: readonly SubscriptionPlanResponse[]
  readonly totalCount: number
  readonly totalCompletedAmount: number
  readonly page: number
  readonly pageSize: number
  readonly search: string
  readonly status?: string
  readonly planId?: string
  readonly dateFrom: string
  readonly dateTo: string
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly hasFilters: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: string | undefined) => void
  readonly onPlanChange: (value: string | undefined) => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onClear: () => void
  readonly onRetry: () => void
}

function PaymentStatusBadge({ status }: { readonly status: string }) {
  return (
    <Badge
      variant={isCompletedPayment(status) ? 'default' : 'outline'}
      className={cn(status.toLowerCase() === 'failed' && 'border-destructive text-destructive')}
    >
      {formatPaymentStatus(status)}
    </Badge>
  )
}

export function AdminPaymentsView(props: AdminPaymentsViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex shrink-0 flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <Receipt aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-primary text-xs font-medium">Quản trị nền tảng</p>
            <h2 id="admin-payments-title" className="text-xl font-semibold">
              Giao dịch thanh toán
            </h2>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={props.onRetry} disabled={props.isFetching}>
          <RefreshCw
            aria-hidden="true"
            className={cn(props.isFetching && 'animate-spin motion-reduce:animate-none')}
          />
          Làm mới
        </Button>
      </header>

      <OperationalListPanel aria-labelledby="admin-payments-title">
        <div className="shrink-0 space-y-3 border-b p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Danh sách giao dịch</h2>
              <p className="text-muted-foreground text-xs" aria-live="polite">
                {props.totalCount} giao dịch · Đã thu:{' '}
                <span className="text-foreground font-medium tabular-nums">
                  {formatAdminCurrency(props.totalCompletedAmount)}
                </span>
              </p>
            </div>
            {props.hasFilters ? (
              <Button variant="ghost" size="sm" onClick={props.onClear}>
                <X aria-hidden="true" />
                Xóa lọc
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="min-w-64 flex-1">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm giao dịch"
                name="paymentSearch"
                autoComplete="off"
                value={props.search}
                placeholder="Số hóa đơn hoặc tên đơn vị thuê…"
                onChange={(event) => props.onSearchChange(event.target.value)}
              />
            </InputGroup>
            <Select
              value={props.status ?? ALL}
              onValueChange={(value) => props.onStatusChange(value === ALL ? undefined : value)}
            >
              <SelectTrigger className="w-full md:w-40" aria-label="Lọc theo trạng thái">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" sideOffset={4}>
                <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatPaymentStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={props.planId ?? ALL}
              onValueChange={(value) => props.onPlanChange(value === ALL ? undefined : value)}
            >
              <SelectTrigger className="w-full md:w-44" aria-label="Lọc theo gói">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" sideOffset={4}>
                <SelectItem value={ALL}>Mọi gói</SelectItem>
                {props.plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.planName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              aria-label="Từ ngày"
              className="w-full md:w-40"
              value={props.dateFrom}
              max={props.dateTo || undefined}
              onChange={(event) => props.onDateFromChange(event.target.value)}
            />
            <Input
              type="date"
              aria-label="Đến ngày"
              className="w-full md:w-40"
              value={props.dateTo}
              min={props.dateFrom || undefined}
              onChange={(event) => props.onDateToChange(event.target.value)}
            />
          </div>
        </div>

        {props.isLoading ? (
          <OperationalLoadingState />
        ) : props.isError ? (
          <OperationalErrorState
            title="Không thể tải danh sách giao dịch"
            onRetry={props.onRetry}
          />
        ) : props.items.length === 0 ? (
          <OperationalEmptyState
            title="Không có giao dịch phù hợp"
            description="Thử thay đổi từ khóa hoặc bộ lọc."
          />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 overflow-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 z-10">Hóa đơn</TableHead>
                    <TableHead className="sticky top-0 z-10">Đơn vị thuê</TableHead>
                    <TableHead className="sticky top-0 z-10">Gói</TableHead>
                    <TableHead className="sticky top-0 z-10">Loại</TableHead>
                    <TableHead className="sticky top-0 z-10 text-right">Số tiền</TableHead>
                    <TableHead className="sticky top-0 z-10">Trạng thái</TableHead>
                    <TableHead className="sticky top-0 z-10">Ngày tạo</TableHead>
                    <TableHead className="sticky top-0 z-10">Ngày thanh toán</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.items.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                      <TableCell>{payment.tenantName ?? '—'}</TableCell>
                      <TableCell>
                        <p>{payment.planName ?? '—'}</p>
                        {payment.billingCycle ? (
                          <p className="text-muted-foreground text-xs">{payment.billingCycle}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>{formatPaymentType(payment.type)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAdminCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatAdminDateTime(payment.createdAt)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatAdminDateTime(payment.paidAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="min-h-0 flex-1 divide-y overflow-y-auto md:hidden">
              {props.items.map((payment) => (
                <article key={payment.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{payment.invoiceNumber}</p>
                      <p className="text-muted-foreground text-xs">{payment.tenantName ?? '—'}</p>
                    </div>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Gói</dt>
                      <dd>{payment.planName ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Loại</dt>
                      <dd>{formatPaymentType(payment.type)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Số tiền</dt>
                      <dd className="tabular-nums">{formatAdminCurrency(payment.amount)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Ngày tạo</dt>
                      <dd className="tabular-nums">{formatAdminDateTime(payment.createdAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        )}
        <OperationalPagination
          page={props.page}
          pageSize={props.pageSize}
          totalCount={props.totalCount}
          isPending={props.isFetching}
          onPageChange={props.onPageChange}
          onPageSizeChange={props.onPageSizeChange}
        />
      </OperationalListPanel>
    </div>
  )
}
