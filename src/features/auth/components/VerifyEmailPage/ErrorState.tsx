import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/routes/app-routes'

interface ErrorStateProps {
  readonly message: string
  readonly resendForm: React.ReactNode
}

export function ErrorState({ message, resendForm }: ErrorStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col justify-center">
      <div className="bg-error-container text-destructive mx-auto flex size-20 items-center justify-center rounded-full">
        <AlertCircle className="size-10" aria-hidden="true" />
      </div>
      <div className="mt-6 text-center">
        <p className="text-destructive text-xs font-semibold">Không thể xác minh email</p>
        <h2 className="text-foreground mt-2 text-2xl leading-8 font-semibold">
          Link xác minh không còn hợp lệ
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6">{message}</p>
      </div>
      <Alert className="border-border bg-muted text-foreground mt-7 rounded-md">
        <AlertCircle className="text-destructive size-4" aria-hidden="true" />
        <AlertTitle>Gợi ý xử lý</AlertTitle>
        <AlertDescription>
          Nếu liên kết đã hết hạn, nhập email đã đăng ký để nhận một liên kết xác minh mới.
        </AlertDescription>
      </Alert>
      {resendForm}
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="outline" size="auth" className="border-secondary text-secondary">
          <Link href={APP_ROUTES.auth.login}>Về trang đăng nhập</Link>
        </Button>
      </div>
    </div>
  )
}
