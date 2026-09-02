import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SubscriptionPlanResponse } from '../types/subscription.types'
import { SubscriptionPage } from './SubscriptionPage'

const createPaymentLinkMutation = {
  isPending: false,
  mutateAsync: vi.fn(),
}

const currentPlan: SubscriptionPlanResponse = {
  id: 'free',
  planName: 'Free',
  monthlyPrice: 0,
  yearlyPrice: 0,
  yearlyDiscountPercent: 0,
  displayOrder: 1,
  features: [],
  status: 'Active',
}

const professionalPlan: SubscriptionPlanResponse = {
  id: 'professional',
  planName: 'Professional',
  monthlyPrice: 500000,
  yearlyPrice: 5100000,
  yearlyDiscountPercent: 15,
  displayOrder: 2,
  features: [],
  status: 'Active',
}

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { role: string } }) => unknown) =>
    selector({ user: { role: 'Tenant Owner' } }),
}))

vi.mock('../components/SubscriptionPage', () => ({
  CurrentPlanCard: () => <div>Current plan</div>,
  PlanCard: ({
    plan,
    onUpgrade,
  }: {
    readonly plan: SubscriptionPlanResponse
    readonly onUpgrade: (plan: SubscriptionPlanResponse) => void
  }) => (
    <button type="button" onClick={() => onUpgrade(plan)}>
      Chọn {plan.planName}
    </button>
  ),
  SubscriptionActionDialog: ({
    open,
    onConfirm,
  }: {
    readonly open: boolean
    readonly onConfirm: () => void
  }) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        Xác nhận thay đổi
      </button>
    ) : null,
  SubscriptionEmptyState: () => null,
  SubscriptionErrorState: () => null,
  SubscriptionPageSkeleton: () => null,
}))

vi.mock('../hooks/use-subscription', () => ({
  useCancelSubscriptionMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCreatePaymentLinkMutation: () => createPaymentLinkMutation,
  useCurrentSubscriptionQuery: () => ({
    data: {
      id: 'subscription-id',
      planName: 'Free',
      planPrice: 0,
      billingCycle: 'Monthly',
      startDate: '2026-08-01T00:00:00Z',
      endDate: '2026-09-01T00:00:00Z',
      status: 'Active',
      autoRenew: true,
      isExpired: false,
      daysRemaining: 8,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useRenewSubscriptionMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSubscriptionPlansQuery: () => ({
    data: [currentPlan, professionalPlan],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

describe('SubscriptionPage billing cycle', () => {
  beforeEach(() => {
    createPaymentLinkMutation.mutateAsync.mockReset()
    createPaymentLinkMutation.mutateAsync.mockResolvedValue(undefined)
  })

  it('includes the selected billing cycle in the upgrade request', async () => {
    const user = userEvent.setup()

    render(<SubscriptionPage />)

    await user.click(screen.getByRole('radio', { name: 'Thanh toán hàng năm' }))
    await user.click(screen.getByRole('button', { name: 'Chọn Professional' }))
    await user.click(screen.getByRole('button', { name: 'Xác nhận thay đổi' }))

    expect(createPaymentLinkMutation.mutateAsync).toHaveBeenCalledWith({
      newPlanId: 'professional',
      billingCycle: 'Yearly',
    })
  })
})
