import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlanCard } from './PlanCard'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { SubscriptionPlanResponse } from '../../types/subscription.types'

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
})

const plan: SubscriptionPlanResponse = {
  id: 'basic',
  planName: 'Basic',
  monthlyPrice: 100000,
  yearlyPrice: 1080000,
  yearlyDiscountPercent: 10,
  displayOrder: 1,
  features: [
    {
      featureCode: 'MaxWarehouses',
      displayName: 'Kho hàng',
      featureType: 'Limit',
      limitValue: 1,
    },
  ],
  status: 'Active',
}

describe('PlanCard', () => {
  it('prevents a downgrade action while exposing its reason', async () => {
    const user = userEvent.setup()
    const onUpgrade = vi.fn()

    render(
      <TooltipProvider>
        <PlanCard
          plan={plan}
          billingCycle="Monthly"
          actionState={{
            disabled: true,
            label: 'Không hỗ trợ hạ gói',
            tooltip: 'Không hỗ trợ hạ gói',
          }}
          onUpgrade={onUpgrade}
        />
      </TooltipProvider>
    )

    const action = screen.getByRole('button', { name: 'Không hỗ trợ hạ gói' })
    expect(action).toBeDisabled()

    await user.click(action)
    expect(onUpgrade).not.toHaveBeenCalled()
  })
})
