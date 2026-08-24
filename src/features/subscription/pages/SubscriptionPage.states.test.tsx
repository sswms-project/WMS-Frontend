import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubscriptionPage } from './SubscriptionPage'

const subscription = {
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

const pageState = vi.hoisted(() => ({
  subscriptionQuery: {} as Record<string, unknown>,
  plansQuery: {} as Record<string, unknown>,
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { role: string } }) => unknown) =>
    selector({ user: { role: 'Tenant Owner' } }),
}))

vi.mock('../components/SubscriptionPage', () => ({
  CurrentPlanCard: () => <div>Current plan</div>,
  PlanCard: () => <div>Available plan</div>,
  SubscriptionActionDialog: () => null,
  SubscriptionEmptyState: ({ title }: { readonly title: string }) => <div>{title}</div>,
  SubscriptionErrorState: () => <div>Subscription error</div>,
  SubscriptionPageSkeleton: () => <div>Subscription skeleton</div>,
}))

vi.mock('../hooks/use-subscription', () => ({
  useCancelSubscriptionMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCurrentSubscriptionQuery: () => pageState.subscriptionQuery,
  useRenewSubscriptionMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSubscriptionPlansQuery: () => pageState.plansQuery,
  useUpgradeSubscriptionMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

describe('SubscriptionPage states', () => {
  beforeEach(() => {
    pageState.subscriptionQuery = {
      data: subscription,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
    pageState.plansQuery = {
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
  })

  it('shows the shared skeleton while subscription data is loading', () => {
    pageState.subscriptionQuery = { ...pageState.subscriptionQuery, isLoading: true }

    render(<SubscriptionPage />)

    expect(screen.getByText('Subscription skeleton')).toBeInTheDocument()
  })

  it('shows the retry state when the subscription query fails', () => {
    pageState.subscriptionQuery = { ...pageState.subscriptionQuery, isError: true }

    render(<SubscriptionPage />)

    expect(screen.getByText('Subscription error')).toBeInTheDocument()
  })

  it('explains when the tenant does not have a subscription', () => {
    pageState.subscriptionQuery = { ...pageState.subscriptionQuery, data: undefined }

    render(<SubscriptionPage />)

    expect(screen.getByText('Chưa có gói dịch vụ')).toBeInTheDocument()
  })

  it('explains when no active plan is available', () => {
    render(<SubscriptionPage />)

    expect(screen.getByText('Chưa có plan active')).toBeInTheDocument()
  })

  it('keeps payment history out of the plan management page', () => {
    render(<SubscriptionPage />)

    expect(screen.queryByText('Lịch sử thanh toán')).not.toBeInTheDocument()
  })
})
