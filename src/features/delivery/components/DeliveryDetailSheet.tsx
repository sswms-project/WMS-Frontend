import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { DeliveryTracking } from '../types/delivery.types'
import { DELIVERY_STATUS_LABELS, formatDeliveryDate } from '../utils/delivery-format'
import { DeliveryStatusBadge } from './DeliveriesPage/DeliveryStatusBadge'

export function DeliveryDetailSheet({
  item,
  staffNames,
  onOpenChange,
}: {
  readonly item: DeliveryTracking | null
  readonly staffNames: Readonly<Record<string, string>>
  readonly onOpenChange: (open: boolean) => void
}) {
  const history = [...(item?.history ?? [])].sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  )
  return (
    <Sheet open={Boolean(item)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-mono">{item?.orderCode ?? 'Chi tiết giao hàng'}</SheetTitle>
          <SheetDescription>
            Thông tin người nhận, phân công và lịch sử trạng thái.
          </SheetDescription>
        </SheetHeader>
        {item ? (
          <div className="space-y-5 px-4 pb-6">
            <DeliveryStatusBadge status={item.currentStatus} />
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs">Kho</dt>
                <dd className="text-sm">{item.warehouseName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Khách hàng</dt>
                <dd className="text-sm">{item.customerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Người nhận</dt>
                <dd className="text-sm">{item.recipientName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Nhân viên giao</dt>
                <dd className="text-sm">
                  {item.assignedDeliveryStaffId
                    ? (item.assignedDeliveryStaffName ??
                      staffNames[item.assignedDeliveryStaffId] ??
                      'Đã phân công')
                    : 'Chưa phân công'}
                </dd>
              </div>
            </dl>
            {item.failedReason ? (
              <p className="text-destructive text-sm">Lý do thất bại: {item.failedReason}</p>
            ) : null}
            <section>
              <h3 className="mb-2 text-sm font-semibold">Lịch sử trạng thái</h3>
              <ol className="space-y-2">
                {history.map((entry) => (
                  <li key={entry.id} className="border-l-2 pl-3 text-sm">
                    <p>
                      {DELIVERY_STATUS_LABELS[
                        entry.oldStatus as keyof typeof DELIVERY_STATUS_LABELS
                      ] ?? entry.oldStatus}{' '}
                      →{' '}
                      {DELIVERY_STATUS_LABELS[
                        entry.newStatus as keyof typeof DELIVERY_STATUS_LABELS
                      ] ?? entry.newStatus}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDeliveryDate(entry.updatedAt)}
                      {entry.note ? ` · ${entry.note}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
