import { Button } from '@/components/ui/button'

interface OperationalPaginationProps {
  readonly page: number
  readonly pageSize: number
  readonly totalCount: number
  readonly isPending?: boolean
  readonly onPageChange: (page: number) => void
}

export function OperationalPagination({
  page,
  pageSize,
  totalCount,
  isPending = false,
  onPageChange,
}: OperationalPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  return (
    <footer className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-t px-3 py-2 sm:px-4">
      <p className="text-muted-foreground text-xs tabular-nums">
        {start}-{end} trên {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </Button>
        <span className="min-w-16 text-center text-xs tabular-nums">
          {page} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount || isPending}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </Button>
      </div>
    </footer>
  )
}
