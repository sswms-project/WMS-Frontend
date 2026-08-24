import { CheckCircle2 } from 'lucide-react'
import type { LifecycleEvent } from '@/features/purchase-order/types/purchase-order.types'
import { formatOperationalDateTime } from '@/features/purchase-order/utils/purchase-order-format'

export function LifecycleTimeline({ events }: { readonly events: readonly LifecycleEvent[] }) {
  if (events.length === 0) {
    return <p className="text-muted-foreground py-4 text-xs">Chưa có lịch sử xử lý.</p>
  }

  return (
    <ol className="flex flex-col">
      {events.map((event, index) => (
        <li
          key={`${event.createdAt}-${event.action}-${index}`}
          className="relative flex gap-3 pb-4"
        >
          {index < events.length - 1 ? (
            <span className="bg-border absolute top-5 bottom-0 left-2 w-px" aria-hidden="true" />
          ) : null}
          <CheckCircle2
            className="text-primary relative mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-medium">{event.action}</p>
            <p className="text-muted-foreground text-xs">
              {event.actorName} · {formatOperationalDateTime(event.createdAt)}
            </p>
            {event.reason ? <p className="mt-1 text-xs">Lý do: {event.reason}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
