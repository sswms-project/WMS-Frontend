import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProductStatusBadgeProps {
  readonly status: string
  readonly className?: string
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const isActive = status?.toLowerCase() === 'active'
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={cn('text-xs font-medium', className)}
    >
      {isActive ? 'Đang hoạt động' : 'Đã lưu trữ'}
    </Badge>
  )
}
