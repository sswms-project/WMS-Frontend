'use client'

import { useState } from 'react'
import { Pencil, Warehouse, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SubscriptionPlanResponse } from '../../types/admin.types'
import { DeactivatePlanDialog } from './DeactivatePlanDialog'
import { SubscriptionPlanFormDialog } from './SubscriptionPlanFormDialog'

const BILLING_CYCLE_LABELS = {
  Monthly: 'tháng',
  Yearly: 'năm',
} as const

const FEATURE_LABELS = [
  { key: 'enableForecasting', label: 'Dự báo nhu cầu' },
  { key: 'enableBarcode', label: 'Mã vạch / QR' },
  { key: 'enableLayoutDesigner', label: 'Thiết kế layout' },
] as const

const priceFormatter = new Intl.NumberFormat('vi-VN')

interface SubscriptionPlanCardProps {
  readonly plan: SubscriptionPlanResponse
}

export function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)

  const enabledFeatures = FEATURE_LABELS.filter((feature) => plan[feature.key])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-foreground text-sm font-semibold">{plan.planName}</p>
            <Badge variant={plan.status === 'Active' ? 'default' : 'outline'}>
              {plan.status === 'Active' ? 'Đang cung cấp' : 'Ngừng cung cấp'}
            </Badge>
          </div>

          <p className="text-foreground text-sm">
            {priceFormatter.format(plan.price)}
            <span className="text-muted-foreground">
              {' '}
              / {BILLING_CYCLE_LABELS[plan.billingCycle]}
            </span>
          </p>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <Warehouse className="size-3.5" aria-hidden="true" />
              Tối đa {plan.maxWarehouses} kho
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              Tối đa {plan.maxUsers} người dùng
            </span>
          </div>

          {enabledFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {enabledFeatures.map((feature) => (
                <Badge key={feature.key} variant="secondary">
                  {feature.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setIsEditOpen(true)}>
            <Pencil className="size-3.5" aria-hidden="true" />
            Sửa
          </Button>
          <Button variant="destructive" onClick={() => setIsDeactivateOpen(true)}>
            Vô hiệu hóa
          </Button>
        </div>
      </CardContent>

      <SubscriptionPlanFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} plan={plan} />
      <DeactivatePlanDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        plan={plan}
      />
    </Card>
  )
}
