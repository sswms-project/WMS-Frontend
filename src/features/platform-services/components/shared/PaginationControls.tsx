import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  readonly page: number
  readonly pageSize: number
  readonly totalCount: number
  readonly isFetching: boolean
  readonly onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  pageSize,
  totalCount,
  isFetching,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  return (
    <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
      <p className="text-muted-foreground text-xs tabular-nums">
        Trang {page}/{totalPages} · {totalCount} kết quả
      </p>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Trang trước"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Trang sau"
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
