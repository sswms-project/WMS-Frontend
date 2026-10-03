import { ArrowRight, ClipboardList, RefreshCw } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { APP_ROUTES } from '@/routes/app-routes'
import type { MyWarehouseTask } from '../../types/warehouse-task.types'

interface WarehouseTaskDirectoryProps {
  readonly title: string
  readonly description: string
  readonly items: readonly MyWarehouseTask[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly canManage?: boolean
  readonly currentUserId?: string
  readonly headerAction?: ReactNode
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
  readonly onAction?: (task: MyWarehouseTask, action: 'Start' | 'Pause' | 'Return') => void
  readonly onOpenRelocation?: (task: MyWarehouseTask) => void
}

const executionLabel: Record<MyWarehouseTask['executionStatus'], string> = {
  Queued: 'Chờ bắt đầu',
  InProgress: 'Đang làm',
  Paused: 'Tạm dừng',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã hủy',
}

const taskTypeLabel: Record<MyWarehouseTask['taskType'], string> = {
  Receiving: 'Nhận hàng',
  PutAway: 'Cất hàng',
  CycleCount: 'Kiểm kê',
  DamagedStock: 'Hàng hỏng',
  Relocation: 'Điều chuyển vị trí',
}

export function WarehouseTaskDirectory({
  title,
  description,
  items,
  totalCount,
  page,
  pageSize,
  isLoading,
  isFetching,
  isError,
  canManage = false,
  currentUserId,
  headerAction,
  onPageChange,
  onRetry,
  onAction,
  onOpenRelocation,
}: WarehouseTaskDirectoryProps) {
  function renderActions(item: MyWarehouseTask) {
    if (
      !canManage ||
      !onAction ||
      item.taskType === 'DamagedStock' ||
      item.assignedTo !== currentUserId
    )
      return null
    const isInProgress = item.executionStatus === 'InProgress'
    return (
      <>
        {!isInProgress && (
          <Button size="sm" variant="outline" onClick={() => onAction(item, 'Start')}>
            {item.executionStatus === 'Paused' ? 'Tiếp tục' : 'Bắt đầu'}
          </Button>
        )}
        {isInProgress && item.priority !== 'Urgent' && (
          <Button size="sm" variant="outline" onClick={() => onAction(item, 'Pause')}>
            Tạm dừng
          </Button>
        )}
        {!isInProgress && (
          <Button size="sm" variant="ghost" onClick={() => onAction(item, 'Return')}>
            Trả lại
          </Button>
        )}
      </>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tải lại"
            onClick={onRetry}
          >
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
          </Button>
        </div>
      </div>
      <section className="bg-card flex min-h-0 flex-1 flex-col border">
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải công việc" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có công việc"
            description="Các nhiệm vụ được giao cho bạn sẽ xuất hiện tại đây."
          />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 overflow-auto md:block">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 z-10">Công việc</TableHead>
                    <TableHead className="sticky top-0 z-10">Mã tham chiếu</TableHead>
                    <TableHead className="sticky top-0 z-10">Kho</TableHead>
                    <TableHead className="sticky top-0 z-10">Người phụ trách</TableHead>
                    <TableHead className="sticky top-0 z-10">Trạng thái</TableHead>
                    <TableHead className="sticky top-0 z-10">Cập nhật</TableHead>
                    <TableHead className="sticky top-0 z-10 text-right">Mở</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={`${item.taskType}-${item.id}`}>
                      <TableCell>{taskTypeLabel[item.taskType]}</TableCell>
                      <TableCell className="font-mono font-medium">{item.referenceCode}</TableCell>
                      <TableCell>{item.warehouseName}</TableCell>
                      <TableCell>{item.assignedToName ?? 'Chưa giao'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.executionStatus === 'InProgress' ? 'default' : 'secondary'}
                        >
                          {executionLabel[item.executionStatus] ?? item.executionStatus}
                        </Badge>
                        {item.priority === 'Urgent' && (
                          <Badge variant="outline" className="ml-1">
                            Khẩn
                          </Badge>
                        )}
                        {item.pauseReason && item.executionStatus === 'Paused' && (
                          <p className="text-muted-foreground mt-1 max-w-48 truncate text-xs">
                            {item.pauseReason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(item.updatedAt))}
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        {renderActions(item)}
                        {item.taskType === 'Relocation' && onOpenRelocation ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => onOpenRelocation(item)}
                            aria-label={`Mở ${item.referenceCode}`}
                          >
                            <ArrowRight aria-hidden="true" />
                          </Button>
                        ) : item.taskType !== 'Relocation' ? (
                          <Button asChild size="icon-sm" variant="ghost">
                            <Link href={getTaskRoute(item)} aria-label={`Mở ${item.referenceCode}`}>
                              <ArrowRight aria-hidden="true" />
                            </Link>
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y md:hidden">
              {items.map((item) => (
                <div key={`${item.taskType}-${item.id}`} className="flex items-center gap-3 p-3">
                  <ClipboardList className="text-primary size-5" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{taskTypeLabel[item.taskType]}</p>
                    <p className="text-muted-foreground truncate font-mono text-xs">
                      {item.referenceCode} · {item.warehouseName}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {executionLabel[item.executionStatus] ?? item.executionStatus}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {renderActions(item)}
                    {item.taskType === 'Relocation' && onOpenRelocation ? (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => onOpenRelocation(item)}
                        aria-label={`Mở ${item.referenceCode}`}
                      >
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    ) : item.taskType !== 'Relocation' ? (
                      <Button asChild size="icon-sm" variant="ghost">
                        <Link href={getTaskRoute(item)} aria-label={`Mở ${item.referenceCode}`}>
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <OperationalPagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              isPending={isFetching}
              onPageChange={onPageChange}
            />
          </>
        )}
      </section>
    </div>
  )
}

function getTaskRoute(task: MyWarehouseTask): Route {
  if (task.taskType === 'PutAway') return APP_ROUTES.inboundPutawayDetail(task.id) as Route
  if (task.taskType === 'CycleCount') return APP_ROUTES.cycleCountDetail(task.id)
  if (task.taskType === 'DamagedStock') return APP_ROUTES.stockAdjustmentDetail(task.id)
  // Mở màn nhận hàng đã lọc sẵn theo mã yêu cầu nhập kho được giao.
  return `${APP_ROUTES.inbound}?search=${encodeURIComponent(task.referenceCode)}` as Route
}
