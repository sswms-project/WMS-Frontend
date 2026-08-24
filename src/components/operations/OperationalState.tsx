import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

export function OperationalLoadingState({ rows = 6 }: { readonly rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12" />
      ))}
    </div>
  )
}

interface OperationalErrorStateProps {
  readonly title: string
  readonly description?: string
  readonly onRetry: () => void
}

export function OperationalErrorState({
  title,
  description = 'Vui lòng kiểm tra kết nối hoặc quyền truy cập rồi thử lại.',
  onRetry,
}: OperationalErrorStateProps) {
  return (
    <Empty className="min-h-64 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert className="text-destructive" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RefreshCw aria-hidden="true" />
        Thử lại
      </Button>
    </Empty>
  )
}

export function OperationalEmptyState({
  title,
  description,
}: {
  readonly title: string
  readonly description: string
}) {
  return (
    <Empty className="min-h-64 border-0">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
