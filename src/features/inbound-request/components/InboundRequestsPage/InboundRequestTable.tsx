import Link from 'next/link'
import type { Route } from 'next'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
import { APP_ROUTES } from '@/routes/app-routes'
import { inboundSourceLabels } from '../../schemas/inbound-request.schema'
import {
  INBOUND_REQUEST_STATUS,
  type InboundRequestStatus,
  type InboundRequestSummary,
} from '../../types/inbound-request.types'
import {
  formatOperationalDate,
  formatOperationalDateTime,
  formatQuantity,
  INBOUND_REQUEST_STATUS_LABELS,
} from '../../utils/inbound-request-format'
import { InboundRequestStatusBadge } from './InboundRequestStatusBadge'
import { InboundRequestRowActions } from './InboundRequestRowActions'

interface InboundRequestTableProps {
  readonly items: readonly InboundRequestSummary[]
  readonly canDelete: boolean
  readonly canCreate: boolean
  readonly canSubmit: boolean
  readonly canApprove: boolean
  readonly isDeleting: boolean
  readonly isSubmitting: boolean
  readonly isApproving: boolean
  readonly isDeletingMany: boolean
  readonly selectedStatus: InboundRequestStatus | null
  readonly selectAllStatus: InboundRequestStatus | null
  readonly selectAllIds: readonly string[]
  readonly isDuplicating: boolean
  readonly selectedIds: readonly string[]
  readonly allSelected: boolean
  readonly onDelete: (item: InboundRequestSummary) => void
  readonly onSubmit: (item: InboundRequestSummary) => void
  readonly onApprove: (item: InboundRequestSummary) => void
  readonly onDuplicate: (item: InboundRequestSummary) => void
  readonly onSelectionChange: (ids: readonly string[]) => void
}

function receivedPercent(item: InboundRequestSummary) {
  return item.orderedQuantity <= 0
    ? 0
    : Math.min(100, (item.receivedQuantity / item.orderedQuantity) * 100)
}

export function InboundRequestTableSkeleton() {
  return (
    <div className="flex-1 overflow-hidden" aria-label="Đang tải danh sách yêu cầu nhập kho">
      <Table className="min-w-[1200px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-12">
              <Skeleton className="size-4" />
            </TableHead>
            {[
              'Mã yêu cầu',
              'Nguồn hàng',
              'Kho nhận',
              'Trạng thái',
              'Tiến độ',
              'Ngày tạo',
              'Dự kiến',
              '',
            ].map((heading) => (
              <TableHead key={heading} className="bg-card sticky top-0 z-10">
                {heading}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="size-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-2 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto size-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function InboundRequestTable({
  items,
  canDelete,
  canCreate,
  canSubmit,
  canApprove,
  isDeleting,
  isSubmitting,
  isApproving,
  isDeletingMany,
  selectedStatus,
  selectAllStatus,
  selectAllIds,
  isDuplicating,
  selectedIds,
  allSelected,
  onDelete,
  onSubmit,
  onApprove,
  onDuplicate,
  onSelectionChange,
}: InboundRequestTableProps) {
  return (
    <div className="hidden min-h-0 flex-1 overflow-auto md:block">
      <Table className="min-w-[1200px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-card sticky top-0 z-10 w-12">
              <Checkbox
                aria-label={`Chọn tất cả ${selectAllStatus ? INBOUND_REQUEST_STATUS_LABELS[selectAllStatus] : 'yêu cầu nhập kho'} trên trang`}
                checked={allSelected}
                disabled={
                  selectAllIds.length === 0 || isDeletingMany || isSubmitting || isApproving
                }
                onCheckedChange={(checked) => onSelectionChange(checked ? selectAllIds : [])}
              />
            </TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-56">Mã yêu cầu</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-44">Nguồn hàng</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-36">Kho nhận</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32">Trạng thái</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-36">Tiến độ nhận</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-44">Ngày tạo</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-28">Dự kiến</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-16">
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {(item.status === INBOUND_REQUEST_STATUS.Draft && (canDelete || canSubmit)) ||
                (item.status === INBOUND_REQUEST_STATUS.PendingApproval && canApprove) ? (
                  <Checkbox
                    aria-label={`Chọn ${item.inboundRequestCode}`}
                    checked={selectedIds.includes(item.id)}
                    disabled={
                      isDeletingMany ||
                      isSubmitting ||
                      isApproving ||
                      (selectedStatus !== null && item.status !== selectedStatus)
                    }
                    onCheckedChange={(checked) =>
                      onSelectionChange(
                        checked
                          ? [...selectedIds, item.id]
                          : selectedIds.filter((id) => id !== item.id)
                      )
                    }
                  />
                ) : null}
              </TableCell>
              <TableCell className="min-w-0">
                <div className="min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                        className="text-primary block truncate font-mono font-semibold underline-offset-4 hover:underline"
                        translate="no"
                      >
                        {item.inboundRequestCode}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono" translate="no">
                      {item.inboundRequestCode}
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-muted-foreground truncate text-xs">{item.createdByName}</p>
                </div>
              </TableCell>
              <TableCell className="min-w-0">
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary block min-w-0"
                >
                  <p className="truncate">
                    {item.supplierName ?? item.sourceName ?? 'Chưa xác định'}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {inboundSourceLabels[item.sourceType]}
                  </p>
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary block truncate"
                >
                  {item.warehouseName ?? 'Chưa xác định'}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  aria-label={`Xem yêu cầu ${item.inboundRequestCode}, trạng thái ${INBOUND_REQUEST_STATUS_LABELS[item.status]}`}
                >
                  <InboundRequestStatusBadge status={item.status} />
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary flex flex-col gap-1"
                  aria-label={`Xem tiến độ nhận của ${item.inboundRequestCode}`}
                >
                  <span className="text-xs tabular-nums">
                    {formatQuantity(item.receivedQuantity)} / {formatQuantity(item.orderedQuantity)}
                  </span>
                  <Progress value={receivedPercent(item)} />
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary block whitespace-nowrap"
                >
                  {formatOperationalDateTime(item.createdAt)}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={APP_ROUTES.inboundRequestDetail(item.id) as Route}
                  className="hover:text-primary block"
                >
                  {formatOperationalDate(item.expectedDate)}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <InboundRequestRowActions
                  item={item}
                  canCreate={canCreate}
                  canSubmit={canSubmit}
                  canApprove={canApprove}
                  canDelete={canDelete}
                  isSubmitting={isSubmitting}
                  isApproving={isApproving}
                  isDeleting={isDeleting}
                  isDuplicating={isDuplicating}
                  onSubmit={onSubmit}
                  onApprove={onApprove}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
