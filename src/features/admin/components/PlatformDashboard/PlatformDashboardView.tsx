import {
  Activity,
  Building2,
  CircleCheck,
  CircleHelp,
  CircleX,
  CreditCard,
  RefreshCw,
  WalletCards,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PlatformDashboardResponse } from '../../types/admin.types'
import { formatAdminCurrency, formatAdminDateTime } from '../../utils/platform-admin-format'

interface PlatformDashboardViewProps {
  readonly data?: PlatformDashboardResponse
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isFetching: boolean
  readonly onRetry: () => void
}

function HealthIcon({ status }: { readonly status: string }) {
  if (status === 'Healthy')
    return <CircleCheck className="text-primary size-4" aria-hidden="true" />
  if (status === 'Unhealthy')
    return <CircleX className="text-destructive size-4" aria-hidden="true" />
  return <CircleHelp className="text-chart-4 size-4" aria-hidden="true" />
}

export function PlatformDashboardView({
  data,
  isLoading,
  isError,
  isFetching,
  onRetry,
}: PlatformDashboardViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-label="Đang tải dashboard nền tảng">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-72 lg:col-span-8" />
          <Skeleton className="h-72 lg:col-span-4" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <CircleX aria-hidden="true" />
        <AlertTitle>Không thể tải dashboard nền tảng</AlertTitle>
        <AlertDescription>
          Dữ liệu vận hành hiện chưa sẵn sàng.
          <Button variant="outline" size="sm" className="ml-3" onClick={onRetry}>
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const metrics = [
    { label: 'Tổng tenant', value: data.tenantSummary.total, icon: Building2 },
    { label: 'Tenant hoạt động', value: data.tenantSummary.active, icon: Activity },
    { label: 'Đăng ký hiệu lực', value: data.subscriptionSummary.active, icon: CreditCard },
    {
      label: 'Doanh thu hoàn tất',
      value: formatAdminCurrency(data.revenueSummary.totalCompleted),
      icon: WalletCards,
    },
  ]
  const maxPlanCount = Math.max(...data.planDistribution.map((item) => item.tenantCount), 1)

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary text-xs font-medium">Quản trị nền tảng</p>
          <h2 className="text-xl font-semibold">Dashboard hệ thống</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Tổng quan tenant, đăng ký, doanh thu đã hoàn tất và sức khỏe dịch vụ.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={isFetching} onClick={onRetry}>
          <RefreshCw
            className={cn('size-4', isFetching && 'animate-spin motion-reduce:animate-none')}
            aria-hidden="true"
          />
          Làm mới
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số chính">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="bg-card flex min-h-24 items-center gap-4 border p-4">
            <span className="bg-primary/8 text-primary flex size-10 items-center justify-center">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="bg-card border p-4 lg:col-span-8" aria-labelledby="tenant-status-title">
          <h2 id="tenant-status-title" className="text-sm font-semibold">
            Phân bổ trạng thái tenant
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Có {data.tenantSummary.newLast30Days} tenant mới trong 30 ngày.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Hoạt động', data.tenantSummary.active, 'bg-primary'],
              ['Tạm ngưng', data.tenantSummary.suspended, 'bg-destructive'],
              ['Chờ kích hoạt', data.tenantSummary.pending, 'bg-chart-4'],
              ['Không hoạt động', data.tenantSummary.inactive, 'bg-muted-foreground'],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="border p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <i className={cn('size-2', color)} aria-hidden="true" />
                    {label}
                  </span>
                  <strong className="tabular-nums">{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="bg-card border p-4 lg:col-span-4"
          aria-labelledby="service-health-title"
        >
          <h2 id="service-health-title" className="text-sm font-semibold">
            Sức khỏe dịch vụ
          </h2>
          <div className="mt-3 divide-y">
            {data.serviceHealth.map((service) => (
              <div key={service.service} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <HealthIcon status={service.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{service.service}</p>
                    <Badge variant="outline">{service.status}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatAdminDateTime(service.checkedAt)}
                  </p>
                  {service.message ? (
                    <p className="text-destructive mt-1 text-xs">{service.message}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section
          className="bg-card border p-4 lg:col-span-7"
          aria-labelledby="plan-distribution-title"
        >
          <h2 id="plan-distribution-title" className="text-sm font-semibold">
            Phân bổ theo gói
          </h2>
          {data.planDistribution.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              Chưa có đăng ký hiệu lực.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.planDistribution.map((item) => (
                <div key={item.planId}>
                  <div className="mb-1 flex justify-between gap-3 text-xs">
                    <span>{item.planName}</span>
                    <span>{item.tenantCount} tenant</span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden">
                    <div
                      className="bg-chart-1 h-full"
                      style={{ width: `${(item.tenantCount / maxPlanCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section
          className="bg-card border p-4 lg:col-span-5"
          aria-labelledby="subscription-status-title"
        >
          <h2 id="subscription-status-title" className="text-sm font-semibold">
            Trạng thái đăng ký
          </h2>
          <dl className="mt-4 grid grid-cols-3 divide-x border">
            <div className="p-3 text-center">
              <dt className="text-muted-foreground text-xs">Hiệu lực</dt>
              <dd className="mt-1 text-lg font-semibold">{data.subscriptionSummary.active}</dd>
            </div>
            <div className="p-3 text-center">
              <dt className="text-muted-foreground text-xs">Hết hạn</dt>
              <dd className="mt-1 text-lg font-semibold">{data.subscriptionSummary.expired}</dd>
            </div>
            <div className="p-3 text-center">
              <dt className="text-muted-foreground text-xs">Đã hủy</dt>
              <dd className="mt-1 text-lg font-semibold">{data.subscriptionSummary.cancelled}</dd>
            </div>
          </dl>
          <p className="text-muted-foreground mt-4 text-xs">
            Tháng này: {formatAdminCurrency(data.revenueSummary.thisMonthCompleted)} doanh thu đã
            hoàn tất.
          </p>
        </section>
      </div>
    </div>
  )
}
