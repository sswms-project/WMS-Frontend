import { CreditCard } from 'lucide-react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface SubscriptionEmptyStateProps {
  readonly title: string
  readonly description: string
}

export function SubscriptionEmptyState({ title, description }: SubscriptionEmptyStateProps) {
  return (
    <Empty className="border-border bg-card min-h-64 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CreditCard aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p className="text-muted-foreground">
          Nếu dữ liệu vẫn chưa xuất hiện, hãy liên hệ quản trị viên hệ thống.
        </p>
      </EmptyContent>
    </Empty>
  )
}
