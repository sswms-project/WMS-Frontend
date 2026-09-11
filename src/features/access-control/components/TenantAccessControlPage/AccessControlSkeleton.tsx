import { Skeleton } from '@/components/ui/skeleton'

export function AccessControlSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-4"
      aria-label="Đang tải phân quyền"
      aria-busy="true"
    >
      <Skeleton className="h-16 w-full max-w-xl rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-64 rounded-md" />
      </div>
      <div className="border-border min-h-0 flex-1 overflow-hidden rounded-md border">
        <div className="min-w-0 flex-1">
          <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-9 w-full max-w-sm" />
            <Skeleton className="ml-auto h-8 w-28" />
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
