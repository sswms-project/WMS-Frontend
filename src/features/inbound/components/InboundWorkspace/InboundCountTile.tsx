import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type InboundTileTone = 'default' | 'active' | 'warning' | 'danger'

/** Ô số liệu dùng chung ở đầu các trang nhập kho; màu nhấn chỉ bật khi số lớn hơn 0. */
export function InboundCountTile({
  icon: Icon,
  label,
  value,
  isLoading,
  isError,
  tone = 'default',
  index = 0,
}: {
  readonly icon: LucideIcon
  readonly label: string
  readonly value: number
  readonly isLoading: boolean
  readonly isError: boolean
  readonly tone?: InboundTileTone
  readonly index?: number
}) {
  const lit = !isLoading && !isError && value > 0
  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className="bg-card motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 fill-mode-backwards animation-duration-300 flex items-center gap-3 px-4 py-3"
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center',
          lit && tone === 'danger'
            ? 'bg-destructive/10 text-destructive'
            : lit && tone === 'warning'
              ? 'bg-warning-container text-on-warning-container'
              : lit && tone === 'active'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium">{label}</p>
      {isLoading ? (
        <Skeleton className="h-7 w-10 shrink-0" aria-hidden="true" />
      ) : (
        <p className="shrink-0 text-2xl font-semibold tabular-nums">
          {isError ? '—' : value.toLocaleString('vi-VN')}
        </p>
      )}
    </div>
  )
}
