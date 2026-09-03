import Link from 'next/link'
import { ArrowLeft, Building2, CircleCheck, CirclePause, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_ROUTES } from '@/routes/app-routes'
import { cn } from '@/lib/utils'
import type { TenantDetailsResponse } from '../../types/admin.types'
import {
  formatAdminCurrency,
  formatAdminDate,
  formatAdminDateTime,
} from '../../utils/platform-admin-format'

interface TenantDetailsViewProps {
  readonly data?: TenantDetailsResponse
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isFetching: boolean
  readonly isPending: boolean
  readonly onRetry: () => void
  readonly onStateAction: () => void
}

function DetailList({ items }: { readonly items: ReadonlyArray<readonly [string, string]> }) {
  return (
    <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted-foreground text-xs">{label}</dt>
          <dd className="mt-1 text-sm break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function TenantDetailsView({
  data,
  isLoading,
  isError,
  isFetching,
  isPending,
  onRetry,
  onStateAction,
}: TenantDetailsViewProps) {
  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-96 lg:col-span-8" />
          <Skeleton className="h-96 lg:col-span-4" />
        </div>
      </div>
    )
  if (isError || !data)
    return (
      <Alert variant="destructive">
        <AlertTitle>Không thể tải chi tiết tenant</AlertTitle>
        <AlertDescription>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    )
  const isActive = data.status === 'Active'

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button asChild variant="link" className="h-auto px-0 text-xs">
            <Link href={APP_ROUTES.admin.tenants}>
              <ArrowLeft aria-hidden="true" />
              Quay lại danh sách tenant
            </Link>
          </Button>
          <div className="mt-2 flex items-center gap-3">
            <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
              <Building2 aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">{data.tenantName}</h2>
              <p className="text-muted-foreground font-mono text-xs">{data.id}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              isActive ? 'border-primary/30 text-primary' : 'border-destructive/30 text-destructive'
            )}
          >
            {data.status}
          </Badge>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Làm mới chi tiết tenant"
            disabled={isFetching}
            onClick={onRetry}
          >
            <RefreshCw
              className={cn(isFetching && 'animate-spin motion-reduce:animate-none')}
              aria-hidden="true"
            />
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <section className="bg-card border p-4">
            <h2 className="text-sm font-semibold">Tổ chức và chủ sở hữu</h2>
            <DetailList
              items={[
                ['Email tenant', data.email],
                ['Điện thoại', data.phone],
                ['Địa chỉ', data.address ?? '—'],
                ['Ngày tạo', formatAdminDate(data.createdAt)],
                ['Chủ sở hữu', data.owner.fullName],
                ['Email chủ sở hữu', data.owner.email],
                ['Điện thoại chủ sở hữu', data.owner.phone ?? '—'],
                ['Đăng nhập gần nhất', formatAdminDateTime(data.owner.lastLoginAt)],
              ]}
            />
          </section>
          <section className="bg-card border p-4">
            <h2 className="text-sm font-semibold">Mức sử dụng</h2>
            <dl className="mt-4 grid grid-cols-2 divide-x border sm:grid-cols-4">
              <div className="p-3">
                <dt className="text-muted-foreground text-xs">Người dùng hoạt động</dt>
                <dd className="mt-1 text-lg font-semibold">{data.usage.activeUsers}</dd>
              </div>
              <div className="p-3">
                <dt className="text-muted-foreground text-xs">Tổng người dùng</dt>
                <dd className="mt-1 text-lg font-semibold">{data.usage.totalUsers}</dd>
              </div>
              <div className="p-3">
                <dt className="text-muted-foreground text-xs">Kho hoạt động</dt>
                <dd className="mt-1 text-lg font-semibold">{data.usage.activeWarehouses}</dd>
              </div>
              <div className="p-3">
                <dt className="text-muted-foreground text-xs">Tổng kho</dt>
                <dd className="mt-1 text-lg font-semibold">{data.usage.totalWarehouses}</dd>
              </div>
            </dl>
          </section>
          <section className="bg-card border p-4">
            <h2 className="text-sm font-semibold">Vòng đời đăng ký</h2>
            {data.subscription ? (
              <DetailList
                items={[
                  ['Gói hiện tại', data.subscription.planName],
                  ['Chu kỳ', data.subscription.billingCycle],
                  ['Hiệu lực từ', formatAdminDate(data.subscription.startDate)],
                  ['Hết hạn', formatAdminDate(data.subscription.endDate)],
                  ['Trạng thái', data.subscription.status],
                  ['Tự động gia hạn', data.subscription.autoRenew ? 'Có' : 'Không'],
                  ['Thay đổi chờ áp dụng', data.subscription.pendingPlanName ?? 'Không có'],
                  ['Chu kỳ chờ áp dụng', data.subscription.pendingBillingCycle ?? '—'],
                ]}
              />
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Tenant chưa có đăng ký.
              </p>
            )}
          </section>
        </div>

        <aside className="order-first space-y-4 lg:order-none lg:col-span-4">
          <Alert variant={isActive ? 'default' : 'destructive'}>
            {isActive ? <CircleCheck aria-hidden="true" /> : <CirclePause aria-hidden="true" />}
            <AlertTitle>Trạng thái tenant: {data.status}</AlertTitle>
            <AlertDescription>
              {isActive
                ? 'Tạm ngưng sẽ thu hồi phiên đăng nhập và chặn truy cập tenant.'
                : data.status === 'Suspended'
                  ? 'Kích hoạt lại để khôi phục quyền truy cập của tenant.'
                  : 'Chỉ tenant đang hoạt động hoặc tạm ngưng mới có thể đổi trạng thái tại đây.'}
              <Button
                className="mt-4 w-full"
                variant={isActive ? 'destructive' : 'default'}
                disabled={isPending || (!isActive && data.status !== 'Suspended')}
                onClick={onStateAction}
              >
                {isActive ? 'Tạm ngưng tenant' : 'Kích hoạt lại tenant'}
              </Button>
            </AlertDescription>
          </Alert>
          <section className="bg-card border p-4">
            <h2 className="text-sm font-semibold">Thanh toán hoàn tất</h2>
            <DetailList
              items={[
                ['Tổng doanh thu', formatAdminCurrency(data.billing.totalCompletedRevenue)],
                [
                  'Thanh toán gần nhất',
                  data.billing.lastPaymentAmount === null
                    ? '—'
                    : formatAdminCurrency(data.billing.lastPaymentAmount),
                ],
                ['Ngày thanh toán', formatAdminDateTime(data.billing.lastPaidAt)],
                ['Số hóa đơn', data.billing.lastInvoiceNumber ?? '—'],
              ]}
            />
          </section>
        </aside>
      </div>
    </div>
  )
}
