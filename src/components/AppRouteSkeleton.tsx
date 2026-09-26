import { Skeleton } from '@/components/ui/skeleton'

interface AppRouteSkeletonProps {
  readonly variant?: 'app' | 'auth' | 'public'
}

export function AppRouteSkeleton({ variant = 'app' }: AppRouteSkeletonProps) {
  if (variant === 'auth') {
    return (
      <main className="bg-background flex min-h-dvh items-center justify-center px-4 py-8">
        <section className="w-full max-w-md space-y-6">
          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto size-12 rounded-xl" />
            <Skeleton className="mx-auto h-7 w-44" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
          <div className="bg-card ring-foreground/10 space-y-5 rounded-xl p-6 ring-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </section>
      </main>
    )
  }

  if (variant === 'public') {
    return (
      <main className="bg-background min-h-dvh px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-28" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-12 w-full max-w-xl" />
              <Skeleton className="h-12 w-4/5 max-w-lg" />
              <Skeleton className="h-5 w-full max-w-md" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-background min-h-full w-full min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="w-full min-w-0 space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="size-10 rounded-full" />
        </header>
        <section className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </section>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </section>
      </div>
    </main>
  )
}
