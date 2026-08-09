import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface WarehousePaginationProps {
  readonly page: number
  readonly pageSize: number
  readonly totalCount: number
  readonly onPageChange: (page: number) => void
}

export function WarehousePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: WarehousePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > pageCount || nextPage === page) return
    onPageChange(nextPage)
  }

  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-t px-3 sm:px-4">
      <p className="text-muted-foreground text-xs">
        {start}-{end} trên {totalCount}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text="Trước"
              aria-disabled={page <= 1}
              onClick={(event) => {
                event.preventDefault()
                handlePageChange(page - 1)
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive onClick={(event) => event.preventDefault()}>
              {page}
              <span className="sr-only">trên {pageCount}</span>
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              text="Sau"
              aria-disabled={page >= pageCount}
              onClick={(event) => {
                event.preventDefault()
                handlePageChange(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
