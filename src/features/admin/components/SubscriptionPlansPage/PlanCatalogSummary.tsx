import { Blocks, Layers3, PercentCircle, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { SubscriptionPlanResponse } from '../../types/admin.types'

interface PlanCatalogSummaryProps {
  readonly plans?: readonly SubscriptionPlanResponse[]
  readonly isLoading: boolean
}

export function PlanCatalogSummary({ plans, isLoading }: PlanCatalogSummaryProps) {
  const activePlanCount = plans?.filter((p) => p.status === 'Active').length ?? 0
  const discountedPlanCount = plans?.filter((p) => p.yearlyDiscountPercent > 0).length ?? 0
  const enabledFeatureCount = new Set(
    plans?.flatMap((plan) => plan.features.map((f) => f.featureCode)) ?? []
  ).size

  const summaryItems = [
    { label: 'Gói đang mở', value: plans?.length ?? 0, icon: Layers3 },
    { label: 'Đang hoạt động', value: activePlanCount, icon: Zap },
    { label: 'Có chiết khấu năm', value: discountedPlanCount, icon: PercentCircle },
    { label: 'Nhóm tính năng', value: enabledFeatureCount, icon: Blocks },
  ]

  return (
    <div className="bg-card/60 grid grid-cols-2 border-t border-l sm:grid-cols-4">
      {summaryItems.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="flex min-h-16 items-center gap-3 border-r border-b px-3 sm:px-4"
          >
            <div className="text-primary bg-primary/8 flex size-8 shrink-0 items-center justify-center">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="mb-1.5 h-4 w-8" />
              ) : (
                <p className="text-foreground text-base font-semibold tabular-nums">{item.value}</p>
              )}
              <p className="text-muted-foreground truncate text-xs">{item.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
