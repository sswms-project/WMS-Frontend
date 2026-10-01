import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReceivingTaskStats } from '../../types/inbound.types'

const CARDS = [
  { label: 'Đơn chờ nhận', key: 'totalOpenCount' },
  { label: 'Chưa giao việc', key: 'unassignedCount' },
  { label: 'Đang nhận', key: 'inProgressCount' },
  { label: 'Tạm dừng', key: 'pausedCount' },
] as const satisfies readonly { label: string; key: keyof ReceivingTaskStats }[]

interface ReceivingTaskStatsCardsProps {
  readonly taskStats: ReceivingTaskStats | null
  readonly isLoading: boolean
  readonly isError: boolean
}

export function ReceivingTaskStatsCards({
  taskStats,
  isLoading,
  isError,
}: ReceivingTaskStatsCardsProps) {
  return (
    <section
      className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4"
      aria-label="Thống kê công việc nhận hàng"
      aria-busy={isLoading}
    >
      {CARDS.map(({ label, key }) => (
        <Card key={key} size="sm" className="border-l-primary border-l-2">
          <CardContent className="flex min-h-16 items-center justify-between gap-2">
            <p className="text-sm font-medium">{label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-10 shrink-0" aria-hidden="true" />
            ) : (
              <p className="text-primary shrink-0 text-2xl font-semibold tabular-nums">
                {isError ? '—' : (taskStats?.[key] ?? 0).toLocaleString('vi-VN')}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
