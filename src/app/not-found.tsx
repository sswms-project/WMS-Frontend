import { ArrowLeft, House } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/routes/app-routes'

export default function NotFound() {
  return (
    <main className="bg-background text-foreground flex min-h-dvh items-center justify-center px-6 py-12">
      <section className="border-border bg-card w-full max-w-lg border p-8 text-center shadow-sm sm:p-12">
        <p className="text-primary mb-4 text-7xl leading-none font-bold tracking-tight">404</p>
        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-[0.2em] uppercase">
          Không tìm thấy trang
        </p>
        <h1 className="text-foreground mb-3 text-2xl font-semibold tracking-tight">
          Trang này không tồn tại
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-sm text-sm leading-6">
          Đường dẫn bạn truy cập có thể đã bị thay đổi hoặc không còn khả dụng.
        </p>
        <Button asChild size="auth">
          <Link href={APP_ROUTES.dashboard}>
            <House />
            Về Dashboard
            <ArrowLeft className="rotate-180" />
          </Link>
        </Button>
      </section>
    </main>
  )
}
