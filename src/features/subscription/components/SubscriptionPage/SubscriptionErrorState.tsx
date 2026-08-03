import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface SubscriptionErrorStateProps {
  readonly title?: string
  readonly description?: string
  readonly onRetry: () => void
}

export function SubscriptionErrorState({
  title = 'Không thể tải dữ liệu gói dịch vụ',
  description = 'Vui lòng kiểm tra kết nối hoặc thử lại sau ít phút.',
  onRetry,
}: SubscriptionErrorStateProps) {
  return (
    <Alert variant="destructive" className="mx-auto max-w-3xl">
      <TriangleAlert className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{description}</span>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Tải lại
        </Button>
      </AlertDescription>
    </Alert>
  )
}
