import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubscriptionPage } from './SubscriptionPage'
import type { PaymentResponse } from '../types/subscription.types'

const payment: PaymentResponse = {
  id: 'completed-payment',
  subscriptionId: 'subscription-1',
  planId: 'plan-1',
  planName: 'Professional',
  invoiceNumber: 'INV-2026-001',
  amount: 200000,
  status: 'Completed',
  paidAt: '2026-08-01T10:00:00+07:00',
  createdAt: '2026-08-01T09:00:00+07:00',
}

const invoice = {
  ...payment,
  paymentId: payment.id,
  subscriptionStartDate: '2026-08-01T10:00:00+07:00',
  subscriptionEndDate: '2026-09-01T10:00:00+07:00',
}

const invoiceDataMutation = {
  mutateAsync: vi.fn().mockResolvedValue(invoice),
  isPending: false,
}

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({ toBlob: vi.fn().mockResolvedValue(new Blob(['receipt'])) })),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (
    selector: (state: { user: { role: string; fullName: string; email: string } }) => unknown
  ) =>
    selector({
      user: { role: 'Tenant Owner', fullName: 'Tenant Owner', email: 'owner@example.com' },
    }),
}))

vi.mock('../components/SubscriptionPage', () => ({
  CurrentPlanCard: () => null,
  InvoicePdfDocument: () => null,
  PaymentHistoryTable: ({
    onDownloadInvoice,
    onPrintInvoice,
  }: {
    onDownloadInvoice: (selectedPayment: PaymentResponse) => void
    onPrintInvoice: (selectedPayment: PaymentResponse) => void
  }) => (
    <div>
      <button type="button" onClick={() => onDownloadInvoice(payment)}>
        Download receipt
      </button>
      <button type="button" onClick={() => onPrintInvoice(payment)}>
        Print receipt
      </button>
    </div>
  ),
  PlanCard: () => null,
  SubscriptionActionDialog: () => null,
  SubscriptionEmptyState: () => null,
  SubscriptionErrorState: () => null,
  SubscriptionPageSkeleton: () => null,
}))

vi.mock('../hooks/use-subscription', () => ({
  useCancelSubscriptionMutation: () => ({ isPending: false }),
  useCurrentSubscriptionQuery: () => ({
    data: {
      id: 'subscription-1',
      planName: 'Professional',
      planPrice: 200000,
      billingCycle: 'Monthly',
      startDate: '2026-08-01T10:00:00+07:00',
      endDate: '2026-09-01T10:00:00+07:00',
      status: 'Active',
      autoRenew: true,
      isExpired: false,
      daysRemaining: 27,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useInvoiceDataMutation: () => invoiceDataMutation,
  usePaymentHistoryQuery: () => ({
    data: { items: [payment], totalCount: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useRenewSubscriptionMutation: () => ({ isPending: false }),
  useSubscriptionPlansQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpgradeSubscriptionMutation: () => ({ isPending: false }),
}))

describe('SubscriptionPage invoice actions', () => {
  beforeEach(() => {
    invoiceDataMutation.mutateAsync.mockClear()
    vi.stubGlobal(
      'open',
      vi.fn(() => ({}))
    )
  })

  it('opens the print route synchronously for a completed payment', () => {
    render(<SubscriptionPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Print receipt' }))

    expect(window.open).toHaveBeenCalledWith(
      '/subscription/invoices/completed-payment/print',
      '_blank',
      'noopener,noreferrer'
    )
    expect(invoiceDataMutation.mutateAsync).not.toHaveBeenCalled()
  })

  it('uses invoice data to generate a completed payment PDF receipt', async () => {
    render(<SubscriptionPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Download receipt' }))

    expect(invoiceDataMutation.mutateAsync).toHaveBeenCalledWith('completed-payment')
  })
})
