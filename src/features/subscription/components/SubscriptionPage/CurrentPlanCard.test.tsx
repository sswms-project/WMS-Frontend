import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CurrentPlanCard } from './CurrentPlanCard'
import type { SubscriptionStatusResponse } from '../../types/subscription.types'

const subscription: SubscriptionStatusResponse = {
  id: 'subscription-1',
  planName: 'Free',
  planPrice: 0,
  billingCycle: 'Monthly',
  startDate: '2026-08-03T00:00:00+07:00',
  endDate: '2026-09-03T00:00:00+07:00',
  status: 'Active',
  autoRenew: false,
  isExpired: false,
  daysRemaining: 25,
}

describe('CurrentPlanCard', () => {
  it('presents the remaining time without exposing the raw backend status', () => {
    render(
      <CurrentPlanCard
        subscription={subscription}
        showRenewAction={false}
        isRenewPending={false}
        isCancelPending={false}
        onRenew={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Còn 25 ngày')).toBeInTheDocument()
    expect(screen.queryByText(/Trạng thái backend/)).not.toBeInTheDocument()
  })

  it('keeps the renew and cancel callbacks connected to the redesigned actions', async () => {
    const user = userEvent.setup()
    const onRenew = vi.fn()
    const onCancel = vi.fn()

    render(
      <CurrentPlanCard
        subscription={subscription}
        showRenewAction
        isRenewPending={false}
        isCancelPending={false}
        onRenew={onRenew}
        onCancel={onCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Gia hạn' }))
    await user.click(screen.getByRole('button', { name: 'Hủy gói' }))

    expect(onRenew).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows the expired state in the plan health band', () => {
    render(
      <CurrentPlanCard
        subscription={{ ...subscription, isExpired: true, daysRemaining: 0 }}
        showRenewAction
        isRenewPending={false}
        isCancelPending={false}
        onRenew={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getAllByText('Đã hết hạn')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Gia hạn' })).toBeEnabled()
  })

  it('does not offer cancellation again for a cancelled subscription', () => {
    render(
      <CurrentPlanCard
        subscription={{ ...subscription, status: 'Cancelled' }}
        showRenewAction={false}
        isRenewPending={false}
        isCancelPending={false}
        onRenew={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Đã hủy')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hủy gói' })).not.toBeInTheDocument()
  })
})
