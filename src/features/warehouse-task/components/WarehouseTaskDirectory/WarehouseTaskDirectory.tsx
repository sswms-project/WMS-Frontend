import { ArrowRight, ClipboardList, RefreshCw } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
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
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
  readonly onAction?: (task: MyWarehouseTask, action: 'Start' | 'Pause' | 'Return') => void
}

const taskTypeLabel: Record<MyWarehouseTask['taskType'], string> = {
  Receiving: 'Nhận hàng',
  PutAway: 'Cất hàng',
  CycleCount: 'Kiểm kê',
  DamagedStock: 'Hàng hỏng',
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
  onPageChange,
  onRetry,
  onAction,
}: WarehouseTaskDirectoryProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <Button type="button" variant="outline" size="icon" aria-label="Tải lại" onClick={onRetry}>
          <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
        </Button>
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
                    <TableHead className="bg-card sticky top-0 z-10">Công việc</TableHead>
                    <TableHead className="bg-card sticky top-0 z-10">Mã tham chiếu</TableHead>
                    <TableHead className="bg-card sticky top-0 z-10">Kho</TableHead>
                    <TableHead className="bg-card sticky top-0 z-10">Trạng thái</TableHead>
                    <TableHead className="bg-card sticky top-0 z-10">Cập nhật</TableHead>
                    <TableHead className="bg-card sticky top-0 z-10 text-right">Mở</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={`${item.taskType}-${item.id}`}>
                      <TableCell>{taskTypeLabel[item.taskType]}</TableCell>
                      <TableCell className="font-mono font-medium">{item.referenceCode}</TableCell>
                      <TableCell>{item.warehouseName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.executionStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(item.updatedAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        {onAction &&
                          item.taskType !== 'DamagedStock' &&
                          item.executionStatus !== 'InProgress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAction(item, 'Start')}
                            >
                              Bắt đầu
                            </Button>
                          )}
                        {onAction &&
                          item.taskType !== 'DamagedStock' &&
                          item.executionStatus === 'InProgress' &&
                          item.priority !== 'Urgent' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAction(item, 'Pause')}
                            >
                              Tạm dừng
                            </Button>
                          )}
                        {onAction &&
                          item.taskType !== 'DamagedStock' &&
                          item.executionStatus !== 'InProgress' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onAction(item, 'Return')}
                            >
                              Trả lại
                            </Button>
                          )}
                        <Button asChild size="icon-sm" variant="ghost">
                          <Link href={getTaskRoute(item)} aria-label={`Mở ${item.referenceCode}`}>
                            <ArrowRight aria-hidden="true" />
                          </Link>
                        </Button>
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
                  </div>
                  <Button asChild size="icon-sm" variant="ghost">
                    <Link href={getTaskRoute(item)} aria-label={`Mở ${item.referenceCode}`}>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
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
  return APP_ROUTES.inbound as Route
}
