import { FileSearch, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function AuditLoadingState() {
  return (
    <div className="space-y-3 p-4" role="status">
      <span className="sr-only">Đang tải Audit Log</span>
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  )
}

export function AuditErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6" role="alert">
      <p>Không thể tải Audit Log.</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RefreshCw data-icon="inline-start" aria-hidden="true" />
        Thử lại
      </Button>
    </div>
  )
}

export function AuditEmptyState({ hasActiveFilters }: { readonly hasActiveFilters: boolean }) {
  return (
    <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
      <FileSearch className="size-8" aria-hidden="true" />
      <p className="text-sm">
        {hasActiveFilters ? 'Không có bản ghi phù hợp bộ lọc.' : 'Chưa có bản ghi Audit Log.'}
      </p>
    </div>
  )
}
