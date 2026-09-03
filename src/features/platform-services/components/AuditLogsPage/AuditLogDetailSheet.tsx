import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { AuditLogItem } from '../../types/platform-services.types'
import { formatAuditValue, formatPlatformDateTime } from '../../utils/platform-services-format'

interface AuditLogDetailSheetProps {
  readonly log: AuditLogItem | null
  readonly onOpenChange: (open: boolean) => void
}

export function AuditLogDetailSheet({ log, onOpenChange }: AuditLogDetailSheetProps) {
  return (
    <Sheet open={log !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto overscroll-contain sm:max-w-xl">
        {log ? (
          <>
            <SheetHeader>
              <SheetTitle>Chi tiết Audit Log</SheetTitle>
              <SheetDescription>
                {log.action} · {formatPlatformDateTime(log.createdAt)}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 pb-6">
              <Detail label="Người thực hiện" value={`${log.actorName} (${log.actorEmail})`} />
              <Detail label="Đối tượng" value={`${log.entityType} · ${log.entityId}`} />
              <Detail label="Mô tả" value={log.description} />
              <Detail label="Lý do" value={log.reason ?? 'Không có'} />
              <AuditValue label="Trước thay đổi" value={log.oldValue} />
              <AuditValue label="Sau thay đổi" value={log.newValue} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Detail({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold uppercase">{label}</p>
      <p className="mt-1 text-sm break-words">{value}</p>
    </div>
  )
}

function AuditValue({ label, value }: { readonly label: string; readonly value: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold uppercase">{label}</p>
      <pre className="bg-muted mt-1 max-h-64 overflow-auto rounded-md p-3 text-xs break-words whitespace-pre-wrap">
        {formatAuditValue(value)}
      </pre>
    </div>
  )
}
