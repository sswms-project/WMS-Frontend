'use client'

import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { BillingCycle } from '../types/subscription.types'

interface BillingCycleToggleProps {
  readonly value: BillingCycle
  readonly onValueChange: (value: BillingCycle) => void
  readonly yearlySavingPercent?: number
}

export function BillingCycleToggle({
  value,
  onValueChange,
  yearlySavingPercent,
}: BillingCycleToggleProps) {
  return (
    <div className="border-border bg-card flex w-fit items-center border p-0.5">
      <ToggleGroup
        type="single"
        value={value}
        variant="default"
        size="sm"
        spacing={0}
        aria-label="Chọn chu kỳ thanh toán"
        onValueChange={(nextValue) => {
          if (nextValue === 'Monthly' || nextValue === 'Yearly') onValueChange(nextValue)
        }}
      >
        <ToggleGroupItem value="Monthly" aria-label="Thanh toán hàng tháng">
          Hàng tháng
        </ToggleGroupItem>
        <ToggleGroupItem value="Yearly" aria-label="Thanh toán hàng năm">
          Hàng năm
          {yearlySavingPercent !== undefined && yearlySavingPercent > 0 && (
            <Badge variant="secondary">-{yearlySavingPercent}%</Badge>
          )}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
