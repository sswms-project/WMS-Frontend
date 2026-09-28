'use client'

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
    <div className="flex flex-col items-start gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">Chu kỳ thanh toán</span>
      <div className="border-border bg-card flex w-fit items-center border p-0.5">
        <ToggleGroup
          type="single"
          value={value}
          variant="default"
          size="lg"
          spacing={0}
          aria-label="Chọn chu kỳ thanh toán"
          onValueChange={(nextValue) => {
            if (nextValue === 'Monthly' || nextValue === 'Yearly') onValueChange(nextValue)
          }}
        >
          <ToggleGroupItem
            value="Monthly"
            aria-label="Thanh toán hàng tháng"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-11"
          >
            Hàng tháng
          </ToggleGroupItem>
          <ToggleGroupItem
            value="Yearly"
            aria-label="Thanh toán hàng năm"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground min-h-11"
          >
            Hàng năm
            {yearlySavingPercent !== undefined && yearlySavingPercent > 0 && (
              <span className="bg-primary-container text-on-primary-container rounded-full px-1.5 py-0.5 text-xs font-semibold">
                Tối đa -{yearlySavingPercent}%
              </span>
            )}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
