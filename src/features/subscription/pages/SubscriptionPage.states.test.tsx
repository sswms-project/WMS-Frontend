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
  PlanCard: ({
    plan,
    actionState,
  }: {
    readonly plan: { readonly planName: string }
    readonly actionState: { readonly disabled: boolean; readonly label: string }
  }) => (
    <div>
      <span>{plan.planName}</span>
      <button disabled={actionState.disabled}>{actionState.label}</button>
    </div>
  ),
  SubscriptionActionDialog: () => null,
  SubscriptionEmptyState: ({
    title,
    description,
  }: {
    readonly title: string
    readonly description: string
  }) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
  SubscriptionErrorState: () => <div>Subscription error</div>,
  SubscriptionPageSkeleton: () => <div>Subscription skeleton</div>,
}))

vi.mock('../hooks/use-subscription', () => ({
  useChangeSubscriptionPlanMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useInitialSubscriptionSelectionMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCurrentSubscriptionQuery: () => pageState.subscriptionQuery,
  useRenewSubscriptionMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSubscriptionPlansQuery: () => pageState.plansQuery,
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

    expect(screen.getByText('Chọn gói để bắt đầu sử dụng KOVIA')).toBeInTheDocument()
  })

  it('explains when no active plan is available', () => {
    render(<SubscriptionPage />)

    expect(screen.getByText('Chưa có gói đang mở đăng ký')).toBeInTheDocument()
  })

  it('keeps payment history out of the plan management page', () => {
    render(<SubscriptionPage />)

    expect(screen.queryByText('Lịch sử thanh toán')).not.toBeInTheDocument()
  })

  it('keeps only the matching checkout available while initial payment is pending', () => {
    pageState.subscriptionQuery = {
      ...pageState.subscriptionQuery,
      data: {
        ...subscription,
        planName: 'Plus',
        billingCycle: 'Monthly',
        status: 'Pending',
        pendingPaymentId: 'payment-1',
      },
    }
    pageState.plansQuery = {
      ...pageState.plansQuery,
      data: [
        {
          id: 'plus',
          planName: 'Plus',
          monthlyPrice: 499000,
          yearlyPrice: 5389200,
          yearlyDiscountPercent: 10,
          displayOrder: 1,
          currency: 'VND',
          status: 'Active',
          features: [],
        },
        {
          id: 'premium',
          planName: 'Premium',
          monthlyPrice: 999000,
          yearlyPrice: 9590400,
          yearlyDiscountPercent: 20,
          displayOrder: 2,
          currency: 'VND',
          status: 'Active',
          features: [],
        },
      ],
    }

    render(<SubscriptionPage />)

    expect(screen.getByRole('button', { name: 'Tiếp tục kích hoạt' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Đang có thanh toán chờ' })).toBeDisabled()
    expect(screen.getByText(/Hãy tiếp tục checkout hiện tại/)).toBeInTheDocument()
  })
})
