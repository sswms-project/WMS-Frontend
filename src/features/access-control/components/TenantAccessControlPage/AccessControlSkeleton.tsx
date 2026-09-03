import { Skeleton } from '@/components/ui/skeleton'

export function AccessControlSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-4"
      aria-label="Đang tải phân quyền"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 border-b pb-4">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-72 max-w-[70vw]" />
        </div>
      </div>
      <div className="hidden gap-2 md:flex">
        <Skeleton className="h-12 w-56 rounded-md" />
        <Skeleton className="h-12 w-56 rounded-md" />
      </div>
      <div className="border-border min-h-0 flex-1 overflow-hidden rounded-md border">
        <div className="min-w-0 flex-1">
          <div className="border-border flex flex-col gap-3 border-b p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-9 w-full max-w-sm" />
          </div>
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
