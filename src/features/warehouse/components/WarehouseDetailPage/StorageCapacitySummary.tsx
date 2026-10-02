import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  formatStorageCapacity,
  getCapacityUtilization,
  type CapacityLocation,
} from '../../utils/storage-capacity'

interface StorageCapacitySummaryProps {
  readonly location: CapacityLocation
}

export function StorageCapacitySummary({ location }: StorageCapacitySummaryProps) {
  const utilization = getCapacityUtilization(location)
  if (!utilization) {
    return (
      <p className="text-muted-foreground text-xs break-words">{formatStorageCapacity(location)}</p>
    )
  }
  const format = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 6 })
  const unit = location.capacityUnitName ?? location.capacityUnitSymbol ?? '—'
  const status =
    utilization.status === 'full'
      ? 'Đã đầy'
      : utilization.status === 'warning'
        ? 'Sắp đầy'
        : 'Còn chỗ'
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 text-xs">
      <div className="flex min-w-0 flex-wrap justify-between gap-1 tabular-nums">
        <span>
          Đã sử dụng:{' '}
          <strong>
            {format(utilization.used)} / {format(utilization.maximum)}
          </strong>
        </span>
        <span className="min-w-0 truncate" title={unit}>
          {unit}
        </span>
      </div>
      <Progress
        value={utilization.percent}
        aria-label="Mức sử dụng sức chứa"
        aria-valuenow={utilization.used}
        aria-valuemin={0}
        aria-valuemax={utilization.maximum}
        aria-valuetext={`${format(utilization.used)} / ${format(utilization.maximum)} ${unit} · ${status}`}
        className={cn(
          'h-1.5 motion-reduce:[&_[data-slot=progress-indicator]]:transition-none',
          utilization.status === 'warning' && '[&_[data-slot=progress-indicator]]:bg-warning',
          utilization.status === 'full' && '[&_[data-slot=progress-indicator]]:bg-destructive'
        )}
      />
      <div className="flex flex-wrap justify-between gap-1 tabular-nums">
        <span>
          Còn trống:{' '}
          <strong>
            {location.remainingCapacity == null ? '—' : format(location.remainingCapacity)}
          </strong>
        </span>
        <span
          className={cn(
            'font-medium',
            utilization.status === 'normal' && 'text-primary',
            utilization.status === 'warning' && 'text-warning',
            utilization.status === 'full' && 'text-destructive'
          )}
        >
          {status} · {format(utilization.rawPercent)}%
        </span>
      </div>
    </div>
  )
}
