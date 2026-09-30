import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductListPage } from '@/features/product/pages'

export default function ProductsRoutePage() {
  return (
    <Suspense fallback={<Skeleton className="h-full min-h-64 w-full" />}>
      <ProductListPage />
    </Suspense>
  )
}
