import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  )
}
