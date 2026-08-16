import { TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/routes/app-routes'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
        <TriangleAlert className="text-destructive size-8" aria-hidden="true" />
      </div>
      <h1 className="text-foreground text-2xl font-semibold">Không có quyền truy cập</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là
        lỗi.
      </p>
      <Button asChild className="mt-2">
        <Link href={APP_ROUTES.dashboard}>Quay về Dashboard</Link>
      </Button>
    </div>
  )
}
