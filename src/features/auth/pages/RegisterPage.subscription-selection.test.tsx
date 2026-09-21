import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage'

const { mutateAsync, usePlans } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue({ message: 'Kiểm tra email để xác minh.' }),
  usePlans: vi.fn(),
}))

vi.mock('../hooks/use-auth', () => ({
  useRegisterMutation: () => ({ mutateAsync, isPending: false }),
}))

vi.mock('@/features/subscription/hooks/use-subscription', () => ({
  usePublicSubscriptionPlansQuery: () => usePlans(),
}))

vi.mock('../components/RegisterPage', () => ({
  BenefitsPanel: () => null,
  RegisterSuccess: ({ message }: { message: string }) => <p>{message}</p>,
  RegisterForm: ({
    onSubmit,
    selectedPlan,
    selectedBillingCycle,
  }: {
    onSubmit: (values: {
      tenantName: string
      ownerName: string
      phone: string
      email: string
      address: string
      password: string
      confirmPassword: string
      acceptTerms: boolean
    }) => Promise<void>
    selectedPlan?: { planName: string }
    selectedBillingCycle: string
  }) => (
    <div>
      <output>{`${selectedPlan?.planName ?? 'none'}-${selectedBillingCycle}`}</output>
      <button
        type="button"
        onClick={() =>
          void onSubmit({
            tenantName: ' Kovia Logistics ',
            ownerName: ' Nguyen Van A ',
            phone: ' 0901234567 ',
            email: ' owner@example.com ',
            address: ' Da Nang ',
            password: 'Password@1',
            confirmPassword: 'Password@1',
            acceptTerms: true,
          })
        }
      >
        Đăng ký
      </button>
    </div>
  ),
}))

describe('RegisterPage subscription selection', () => {
  it('shows a server-resolved plan and preserves it in the registration payload', async () => {
    usePlans.mockReturnValue({
      data: [
        {
          id: 'plan-premium',
          planName: 'Premium',
          monthlyPrice: 500000,
          currency: 'VND',
          yearlyPrice: 5000000,
          yearlyDiscountPercent: 10,
          displayOrder: 2,
          features: [],
          status: 'Active',
        },
      ],
      isLoading: false,
    })

    render(<RegisterPage selectedPlanId="plan-premium" selectedBillingCycle="Yearly" />)

    expect(screen.getByRole('status')).toHaveTextContent('Premium-Yearly')
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantName: 'Kovia Logistics',
          selectedPlanId: 'plan-premium',
          selectedBillingCycle: 'Yearly',
        })
      )
    )
  })
})
