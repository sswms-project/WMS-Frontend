import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { SubscriptionPaymentHistoryPage } from './SubscriptionPaymentHistoryPage'
import type { PaymentResponse } from '../types/subscription.types'

const completedPayment: PaymentResponse = {
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

const pendingPayment: PaymentResponse = {
  ...completedPayment,
  id: 'pending-payment',
  status: 'Pending',
}

const invoiceDownloadMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
}

const authState = vi.hoisted(() => ({ role: 'Tenant Owner' }))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (
    selector: (state: { user: { role: string; fullName: string; email: string } }) => unknown
  ) =>
    selector({
      user: { role: authState.role, fullName: 'Tenant Owner', email: 'owner@example.com' },
    }),
}))

vi.mock('../components/SubscriptionPage', () => ({
  CurrentPlanCard: () => null,
  PaymentHistoryTable: ({
    onDownloadInvoice,
    onPrintInvoice,
  }: {
    onDownloadInvoice: (payment: PaymentResponse) => void
    onPrintInvoice: (payment: PaymentResponse) => void
  }) => (
    <div>
      <button type="button" onClick={() => onDownloadInvoice(completedPayment)}>
        Download completed receipt
      </button>
      <button type="button" onClick={() => onDownloadInvoice(pendingPayment)}>
        Download pending receipt
      </button>
      <button type="button" onClick={() => onPrintInvoice(completedPayment)}>
        Print completed receipt
      </button>
      <button type="button" onClick={() => onPrintInvoice(pendingPayment)}>
        Print pending receipt
      </button>
    </div>
  ),
  PlanCard: () => null,
  SubscriptionActionDialog: () => null,
  SubscriptionEmptyState: () => null,
  SubscriptionErrorState: () => null,
  SubscriptionPageSkeleton: () => null,
  TenantOwnerOnlyState: () => <div>Tenant owner only</div>,
}))

vi.mock('../hooks/use-subscription', () => ({
  useCancelSubscriptionMutation: () => ({ isPending: false }),
  useCurrentSubscriptionQuery: () => ({
    data: {
      id: 'subscription-1',
      planName: 'Professional',
      planPrice: 200000,
      billingCycle: 'Monthly',
      startDate: '2025-01-01T10:00:00+07:00',
      endDate: '2025-02-01T10:00:00+07:00',
      status: 'Active',
      autoRenew: true,
      isExpired: false,
      daysRemaining: 27,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useInvoiceDownloadMutation: () => invoiceDownloadMutation,
  usePaymentHistoryQuery: () => ({
    data: { items: [completedPayment, pendingPayment], totalCount: 2 },
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

describe('SubscriptionPaymentHistoryPage invoice actions', () => {
  const receiptBlob = new Blob(['receipt'])
  const printWindow = {
    opener: window,
    location: { replace: vi.fn() },
  }
  let downloadFileName = ''

  beforeEach(() => {
    authState.role = 'Tenant Owner'
    downloadFileName = ''
    invoiceDownloadMutation.mutateAsync.mockReset()
    invoiceDownloadMutation.mutateAsync.mockResolvedValue(receiptBlob)
    vi.mocked(toast.error).mockClear()
    printWindow.opener = window
    printWindow.location.replace.mockClear()
    vi.stubGlobal(
      'open',
      vi.fn(() => printWindow)
    )
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:receipt'),
      revokeObjectURL: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloadFileName = this.download
    })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('restricts the payment workspace to the tenant owner', () => {
    authState.role = 'Warehouse Manager'

    render(<SubscriptionPaymentHistoryPage />)

    expect(screen.getByText('Tenant owner only')).toBeInTheDocument()
  })

  it('downloads the server-generated invoice PDF', async () => {
    render(<SubscriptionPaymentHistoryPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Download completed receipt' }))

    await waitFor(() => expect(invoiceDownloadMutation.mutateAsync).toHaveBeenCalledOnce())

    expect(invoiceDownloadMutation.mutateAsync).toHaveBeenCalledWith(completedPayment.id)
    expect(URL.createObjectURL).toHaveBeenCalledWith(receiptBlob)
    expect(downloadFileName).toBe('INV-2026-001.pdf')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:receipt')
  })

  it('does not start a browser download when the invoice API fails', async () => {
    invoiceDownloadMutation.mutateAsync.mockRejectedValueOnce(new Error('Invoice API failed'))

    render(<SubscriptionPaymentHistoryPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Download completed receipt' }))

    await waitFor(() => expect(invoiceDownloadMutation.mutateAsync).toHaveBeenCalledOnce())

    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('rejects invoice actions for non-completed payments', () => {
    render(<SubscriptionPaymentHistoryPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Download pending receipt' }))
    fireEvent.click(screen.getByRole('button', { name: 'Print pending receipt' }))

    expect(invoiceDownloadMutation.mutateAsync).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()
  })

  it('opens a usable print window synchronously, clears its opener, and navigates it', () => {
    render(<SubscriptionPaymentHistoryPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Print completed receipt' }))

    expect(window.open).toHaveBeenCalledWith('', '_blank')
    expect(printWindow.opener).toBeNull()
    expect(printWindow.location.replace).toHaveBeenCalledWith(
      '/subscription/invoices/completed-payment/print'
    )
    expect(invoiceDownloadMutation.mutateAsync).not.toHaveBeenCalled()
  })

  it('reports an actual blocked print popup', () => {
    vi.stubGlobal(
      'open',
      vi.fn(() => null)
    )
    render(<SubscriptionPaymentHistoryPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Print completed receipt' }))

    expect(toast.error).toHaveBeenCalledWith(
      'Cửa sổ in đã bị chặn. Vui lòng cho phép popup và thử lại.'
    )
  })
})
