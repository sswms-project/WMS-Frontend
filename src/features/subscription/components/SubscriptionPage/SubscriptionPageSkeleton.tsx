import { Skeleton } from '@/components/ui/skeleton'

export function SubscriptionPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-52" />
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  )
}
