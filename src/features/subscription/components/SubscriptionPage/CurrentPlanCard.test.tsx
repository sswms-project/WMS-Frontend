import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CurrentPlanCard } from './CurrentPlanCard'
import type { SubscriptionStatusResponse } from '../../types/subscription.types'

const subscription: SubscriptionStatusResponse = {
  id: 'subscription-1',
  planName: 'Free',
  planPrice: 0,
  currency: 'VND',
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
        onRenew={vi.fn()}
      />
    )

    expect(screen.getByText('Còn 25 ngày')).toBeInTheDocument()
    expect(screen.queryByText(/Trạng thái backend/)).not.toBeInTheDocument()
  })

  it('keeps the manual renewal callback connected without showing a misleading cancel action', async () => {
    const user = userEvent.setup()
    const onRenew = vi.fn()

    render(
      <CurrentPlanCard
        subscription={subscription}
        showRenewAction
        isRenewPending={false}
        onRenew={onRenew}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Gia hạn thủ công' }))

    expect(onRenew).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Hủy gói' })).not.toBeInTheDocument()
  })

  it('shows the expired state in the plan health band', () => {
    render(
      <CurrentPlanCard
        subscription={{ ...subscription, isExpired: true, daysRemaining: 0 }}
        showRenewAction
        isRenewPending={false}
        onRenew={vi.fn()}
      />
    )

    expect(screen.getByText('Đã hết hạn')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gia hạn thủ công' })).toBeEnabled()
  })

  it('announces a pending billing-cycle change even when the plan itself is not changing', () => {
    render(
      <CurrentPlanCard
        subscription={{
          ...subscription,
          billingCycle: 'Yearly',
          pendingPlanName: null,
          pendingBillingCycle: 'Monthly',
        }}
        showRenewAction={false}
        isRenewPending={false}
        onRenew={vi.fn()}
      />
    )

    expect(screen.getByText('Đã lên lịch chuyển gói')).toBeInTheDocument()
    expect(screen.getByText(/Free \(Hàng tháng\) sẽ được áp dụng/)).toBeInTheDocument()
  })

  it('supports a non-expiring Free plan without rendering a countdown', () => {
    render(
      <CurrentPlanCard
        subscription={{ ...subscription, startDate: '2026-08-03T00:00:00+07:00', endDate: null }}
        showRenewAction={false}
        isRenewPending={false}
        onRenew={vi.fn()}
      />
    )

    expect(screen.getByText('Chưa ghi nhận')).toBeInTheDocument()
    expect(screen.queryByText(/Còn .* ngày/)).not.toBeInTheDocument()
  })
})
