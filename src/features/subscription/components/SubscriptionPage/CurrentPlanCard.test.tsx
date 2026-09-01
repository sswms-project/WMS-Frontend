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

    expect(screen.getByText('Đã hết hạn')).toBeInTheDocument()
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

    expect(screen.getByText('Sẽ hủy')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hủy gói' })).not.toBeInTheDocument()
  })

  it('treats a subscription with a cancellation timestamp as cancelled even while the backend status still reads Active, and keeps showing the remaining time', () => {
    render(
      <CurrentPlanCard
        subscription={{ ...subscription, status: 'Active', cancelledAt: '2026-08-30T11:17:03Z' }}
        showRenewAction={false}
        isRenewPending={false}
        isCancelPending={false}
        onRenew={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Sẽ hủy')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hủy gói' })).not.toBeInTheDocument()
    expect(screen.getByText('Đã lên lịch hủy gói')).toBeInTheDocument()
    expect(screen.getByText('Còn 25 ngày')).toBeInTheDocument()
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
        isCancelPending={false}
        onRenew={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Đã lên lịch chuyển gói')).toBeInTheDocument()
    expect(screen.getByText(/Free \(Hàng tháng\) sẽ được áp dụng/)).toBeInTheDocument()
  })

  it('hides the pending-change banner for a subscription that is also cancelled, instead of showing both at once', () => {
    render(
      <CurrentPlanCard
        subscription={{
          ...subscription,
          status: 'Active',
          cancelledAt: '2026-08-30T11:17:03Z',
          pendingBillingCycle: 'Monthly',
        }}
        showRenewAction={false}
        isRenewPending={false}
        isCancelPending={false}
        onRenew={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Đã lên lịch hủy gói')).toBeInTheDocument()
    expect(screen.queryByText('Đã lên lịch chuyển gói')).not.toBeInTheDocument()
  })

  it('hides the cancelled banner for a subscription that has already expired, instead of showing both at once', () => {
    render(
      <CurrentPlanCard
        subscription={{
          ...subscription,
          status: 'Active',
          isExpired: true,
          daysRemaining: 0,
          cancelledAt: '2026-08-30T11:17:03Z',
        }}
        showRenewAction
        isRenewPending={false}
        isCancelPending={false}
        onRenew={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Gói dịch vụ đã hết hạn')).toBeInTheDocument()
    expect(screen.queryByText('Đã lên lịch hủy gói')).not.toBeInTheDocument()
  })
})
