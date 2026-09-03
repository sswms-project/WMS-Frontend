import Link from 'next/link'
import { Building2, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { APP_ROUTES } from '@/routes/app-routes'
import { cn } from '@/lib/utils'
import type {
  SubscriptionPlanResponse,
  TenantStatus,
  TenantSubscriptionStatus,
  TenantSummaryResponse,
} from '../../types/admin.types'
import { formatAdminDate } from '../../utils/platform-admin-format'

interface TenantDirectoryViewProps {
  readonly items: readonly TenantSummaryResponse[]
  readonly plans: readonly SubscriptionPlanResponse[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly search: string
  readonly status?: TenantStatus
  readonly subscriptionStatus?: TenantSubscriptionStatus
  readonly planId?: string
  readonly sortBy: 'createdAt' | 'tenantName' | 'status' | 'subscriptionEndDate'
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value?: TenantStatus) => void
  readonly onSubscriptionStatusChange: (value?: TenantSubscriptionStatus) => void
  readonly onPlanChange: (value?: string) => void
  readonly onSortChange: (
    value: 'createdAt' | 'tenantName' | 'status' | 'subscriptionEndDate'
  ) => void
  readonly onPageChange: (page: number) => void
  readonly onClear: () => void
  readonly onRetry: () => void
}

function TenantStatusBadge({ status }: { readonly status: TenantStatus }) {
  const label = {
    Active: 'Hoạt động',
    Suspended: 'Tạm ngưng',
    Pending: 'Chờ kích hoạt',
    Inactive: 'Không hoạt động',
  }[status]
  return (
    <Badge
      variant="outline"
      className={cn(
        status === 'Active' && 'border-primary/30 text-primary',
        status === 'Suspended' && 'border-destructive/30 text-destructive'
      )}
    >
      {label}
    </Badge>
  )
}

function isTenantStatus(value: string): value is TenantStatus {
  return ['Pending', 'Active', 'Inactive', 'Suspended'].includes(value)
}

function isSubscriptionStatus(value: string): value is TenantSubscriptionStatus {
  return ['Active', 'Expired', 'Cancelled'].includes(value)
}

function isTenantSort(value: string): value is TenantDirectoryViewProps['sortBy'] {
  return ['createdAt', 'tenantName', 'status', 'subscriptionEndDate'].includes(value)
}

function TenantFilterSelects({ props }: { readonly props: TenantDirectoryViewProps }) {
  return (
    <>
      <Select
        value={props.status ?? 'all'}
        onValueChange={(value) => props.onStatusChange(isTenantStatus(value) ? value : undefined)}
      >
        <SelectTrigger aria-label="Trạng thái tenant">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent align="start" sideOffset={4}>
          <SelectItem value="all">Mọi trạng thái</SelectItem>
          <SelectItem value="Active">Hoạt động</SelectItem>
          <SelectItem value="Suspended">Tạm ngưng</SelectItem>
          <SelectItem value="Pending">Chờ kích hoạt</SelectItem>
          <SelectItem value="Inactive">Không hoạt động</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={props.subscriptionStatus ?? 'all'}
        onValueChange={(value) =>
          props.onSubscriptionStatusChange(isSubscriptionStatus(value) ? value : undefined)
        }
      >
        <SelectTrigger aria-label="Trạng thái đăng ký">
          <SelectValue placeholder="Đăng ký" />
        </SelectTrigger>
        <SelectContent align="start" sideOffset={4}>
          <SelectItem value="all">Mọi đăng ký</SelectItem>
          <SelectItem value="Active">Hiệu lực</SelectItem>
          <SelectItem value="Expired">Hết hạn</SelectItem>
          <SelectItem value="Cancelled">Đã hủy</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={props.planId ?? 'all'}
        onValueChange={(value) => props.onPlanChange(value === 'all' ? undefined : value)}
      >
        <SelectTrigger aria-label="Gói đăng ký">
          <SelectValue placeholder="Gói" />
        </SelectTrigger>
        <SelectContent align="start" sideOffset={4}>
          <SelectItem value="all">Mọi gói</SelectItem>
          {props.plans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.planName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={props.sortBy}
        onValueChange={(value) => {
          if (isTenantSort(value)) props.onSortChange(value)
        }}
      >
        <SelectTrigger aria-label="Sắp xếp">
          <SlidersHorizontal aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" sideOffset={4}>
          <SelectItem value="createdAt">Mới tạo trước</SelectItem>
          <SelectItem value="tenantName">Tên tenant</SelectItem>
          <SelectItem value="status">Trạng thái</SelectItem>
          <SelectItem value="subscriptionEndDate">Ngày hết hạn</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}

export function TenantDirectoryView(props: TenantDirectoryViewProps) {
  const hasFilters = Boolean(
    props.search || props.status || props.subscriptionStatus || props.planId
  )
  const secondaryFilterCount =
    Number(Boolean(props.status)) +
    Number(Boolean(props.subscriptionStatus)) +
    Number(Boolean(props.planId)) +
    Number(props.sortBy !== 'createdAt')

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-col gap-4">
      <header className="flex shrink-0 flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <Building2 aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Quản trị nền tảng</p>
            <h2 className="text-xl font-semibold">Tenant</h2>
            <p className="text-muted-foreground text-sm">
              Tìm kiếm và quản lý tổ chức trên toàn hệ thống.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={props.isFetching}
          onClick={props.onRetry}
        >
          <RefreshCw
            className={cn('size-4', props.isFetching && 'animate-spin motion-reduce:animate-none')}
            aria-hidden="true"
          />
          Làm mới
        </Button>
      </header>

      <section
        className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden border"
        aria-labelledby="tenant-list-title"
      >
        <div className="shrink-0 border-b p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 id="tenant-list-title" className="text-sm font-semibold">
                Danh sách tenant
              </h2>
              <p className="text-muted-foreground text-xs" aria-live="polite">
                {props.totalCount} kết quả
              </p>
            </div>
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={props.onClear}>
                <X aria-hidden="true" />
                Xóa lọc
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2 md:hidden">
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm tenant"
                name="tenantSearch"
                autoComplete="off"
                value={props.search}
                placeholder="Tên, email tenant hoặc chủ sở hữu…"
                onChange={(event) => props.onSearchChange(event.target.value)}
              />
            </InputGroup>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" aria-label="Mở bộ lọc tenant">
                  <SlidersHorizontal aria-hidden="true" />
                  {secondaryFilterCount > 0 ? secondaryFilterCount : null}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full overflow-y-auto overscroll-contain duration-300 sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Bộ lọc tenant</SheetTitle>
                  <SheetDescription>
                    Thu hẹp danh sách theo trạng thái, gói và ngày.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-3 px-4">
                  <TenantFilterSelects props={props} />
                </div>
                <SheetFooter>
                  <Button variant="outline" disabled={!hasFilters} onClick={props.onClear}>
                    Xóa bộ lọc
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden gap-2 md:grid md:grid-cols-2 xl:grid-cols-[minmax(240px,2fr)_1fr_1fr_1fr_1fr]">
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Tìm tenant"
                name="tenantSearch"
                autoComplete="off"
                value={props.search}
                placeholder="Tên, email tenant hoặc chủ sở hữu…"
                onChange={(event) => props.onSearchChange(event.target.value)}
              />
            </InputGroup>
            <TenantFilterSelects props={props} />
          </div>
        </div>

        {props.isLoading ? (
          <OperationalLoadingState />
        ) : props.isError ? (
          <OperationalErrorState title="Không thể tải tenant" onRetry={props.onRetry} />
        ) : props.items.length === 0 ? (
          <OperationalEmptyState
            title="Không có tenant phù hợp"
            description="Thử thay đổi từ khóa hoặc bộ lọc."
          />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 overflow-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-card sticky top-0">Tenant</TableHead>
                    <TableHead className="bg-card sticky top-0">Chủ sở hữu</TableHead>
                    <TableHead className="bg-card sticky top-0">Gói</TableHead>
                    <TableHead className="bg-card sticky top-0 text-center">Người dùng</TableHead>
                    <TableHead className="bg-card sticky top-0 text-center">Kho</TableHead>
                    <TableHead className="bg-card sticky top-0">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.items.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <Link
                          className="text-primary font-medium hover:underline"
                          href={APP_ROUTES.admin.tenantDetail(tenant.id)}
                        >
                          {tenant.tenantName}
                        </Link>
                        <p className="text-muted-foreground mt-0.5 text-xs">{tenant.email}</p>
                      </TableCell>
                      <TableCell>
                        <p>{tenant.ownerName}</p>
                        <p className="text-muted-foreground text-xs">{tenant.ownerEmail}</p>
                      </TableCell>
                      <TableCell>
                        <p>{tenant.subscriptionPlanName ?? 'Chưa đăng ký'}</p>
                        <p className="text-muted-foreground text-xs">
                          Hết hạn: {formatAdminDate(tenant.subscriptionEndDate)}
                        </p>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {tenant.activeUserCount}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {tenant.warehouseCount}
                      </TableCell>
                      <TableCell>
                        <TenantStatusBadge status={tenant.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="min-h-0 flex-1 divide-y overflow-y-auto md:hidden">
              {props.items.map((tenant) => (
                <article key={tenant.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        className="text-primary font-semibold hover:underline"
                        href={APP_ROUTES.admin.tenantDetail(tenant.id)}
                      >
                        {tenant.tenantName}
                      </Link>
                      <p className="text-muted-foreground text-xs">{tenant.ownerName}</p>
                    </div>
                    <TenantStatusBadge status={tenant.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Gói</dt>
                      <dd>{tenant.subscriptionPlanName ?? 'Chưa đăng ký'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Quy mô</dt>
                      <dd>
                        {tenant.activeUserCount} người · {tenant.warehouseCount} kho
                      </dd>
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
        />
      </section>
    </div>
  )
}
