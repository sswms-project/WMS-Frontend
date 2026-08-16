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
  price: 100000,
  billingCycle: 'Monthly',
  maxWarehouses: 1,
  maxUsers: 5,
  enableForecasting: false,
  enableBarcode: true,
  enableLayoutDesigner: false,
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
