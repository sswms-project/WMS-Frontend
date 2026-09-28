import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { AuditLogItem } from '../../types/platform-services.types'
import { formatPlatformDateTime } from '../../utils/platform-services-format'

interface AuditLogDetailSheetProps {
  readonly log: AuditLogItem | null
  readonly onOpenChange: (open: boolean) => void
}

export function AuditLogDetailSheet({ log, onOpenChange }: AuditLogDetailSheetProps) {
  return (
    <Sheet open={log !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto overscroll-contain sm:max-w-2xl lg:max-w-[50vw]">
        {log ? (
          <>
            <SheetHeader>
              <SheetTitle>{log.actionLabel}</SheetTitle>
              <SheetDescription>{formatPlatformDateTime(log.createdAt)}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-4 pb-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Người thực hiện" value={log.actorName} hint={log.actorEmail} />
                <Detail label="Đối tượng thao tác" value={log.entityTypeLabel} />
                <Detail label="Tham chiếu" value={log.referenceDisplay} />
                {log.warehouseName ? (
                  <Detail
                    label="Kho liên quan"
                    value={[log.warehouseCode, log.warehouseName].filter(Boolean).join(' · ')}
                  />
                ) : null}
              </div>

              <section className="border p-4" aria-labelledby="audit-summary-title">
                <h3 id="audit-summary-title" className="text-sm font-semibold">
                  Mô tả chi tiết
                </h3>
                <p className="mt-2 text-sm">{log.summary}</p>
              </section>

              {log.changes.length > 0 ? (
                <section aria-labelledby="audit-changes-title">
                  <h3 id="audit-changes-title" className="mb-2 text-sm font-semibold">
                    Nội dung thay đổi
                  </h3>
                  <div className="divide-y border">
                    {log.changes.map((change, index) => (
                      <div key={`${change.label}-${index}`} className="space-y-2 p-3">
                        <p className="text-sm font-medium">{change.label}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <ChangeValue label="Trước" value={change.before} />
                          <ChangeValue label="Sau" value={change.after} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Detail({
  label,
  value,
  hint,
}: {
  readonly label: string
  readonly value: string
  readonly hint?: string
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-sm font-medium break-words">{value}</p>
      {hint ? <p className="text-muted-foreground text-xs break-all">{hint}</p> : null}
    </div>
  )
}

function ChangeValue({ label, value }: { readonly label: string; readonly value: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-sm break-words">{value ?? '—'}</p>
    </div>
  )
}
