import { Skeleton } from '@/components/ui/skeleton'

export function SubscriptionPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-9 w-52" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  )
}
