'use client'

import { Check, ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { SubscriptionPlanResponse } from '../types/subscription.types'
import { getFeatureRows } from '../utils/format-subscription'

const DEFAULT_PREVIEW_COUNT = 3

interface PlanFeatureSummaryProps {
  readonly plan: SubscriptionPlanResponse
  readonly previewCount?: number
}

export function PlanFeatureSummary({
  plan,
  previewCount = DEFAULT_PREVIEW_COUNT,
}: PlanFeatureSummaryProps) {
  const featureRows = getFeatureRows(plan)
  const previewRows = featureRows.slice(0, previewCount)
  const hiddenFeatureCount = featureRows.length - previewRows.length

  if (featureRows.length === 0) {
    return <p className="text-muted-foreground text-xs">Chưa cấu hình quyền lợi cho gói này.</p>
  }

  return (
    <div className="flex flex-col gap-2.5">
      <ItemGroup className="gap-2">
        {previewRows.map((feature) => (
          <FeatureItem key={feature.code} feature={feature} />
        ))}
      </ItemGroup>

      {hiddenFeatureCount > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="w-fit px-0">
              <ListChecks data-icon="inline-start" aria-hidden="true" />
              Xem tất cả {featureRows.length} quyền lợi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Quyền lợi gói {plan.planName}</DialogTitle>
              <DialogDescription>
                Các tính năng và giới hạn hiện được cấu hình cho gói dịch vụ này.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[min(60dvh,28rem)] pr-3">
              <ItemGroup className="gap-2">
                {featureRows.map((feature) => (
                  <FeatureItem key={feature.code} feature={feature} showDescription />
                ))}
              </ItemGroup>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface FeatureItemProps {
  readonly feature: ReturnType<typeof getFeatureRows>[number]
  readonly showDescription?: boolean
}

function FeatureItem({ feature, showDescription = false }: FeatureItemProps) {
  return (
    <Item size="xs" variant={showDescription ? 'muted' : 'default'} className="min-w-0">
      <ItemMedia variant="icon">
        <Check className="text-primary" aria-hidden="true" />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="truncate">{feature.label}</ItemTitle>
        {showDescription && feature.description && (
          <ItemDescription>{feature.description}</ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <Badge variant="outline">{feature.value}</Badge>
      </ItemActions>
    </Item>
  )
}
