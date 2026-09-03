import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/lib/query-keys'
import { PaymentResultPage } from './PaymentResultPage'

const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  push: vi.fn(),
  invalidateQueries: vi.fn(),
  syncResult: {
    data: undefined as string | undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => mocks.searchParams,
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}))

vi.mock('../hooks/use-subscription', () => ({
  useSyncPaymentStatusQuery: () => mocks.syncResult,
}))

describe('PaymentResultPage', () => {
  beforeEach(() => {
    mocks.searchParams = new URLSearchParams('orderCode=123456789')
    mocks.push.mockReset()
    mocks.invalidateQueries.mockReset()
    mocks.syncResult.data = undefined
    mocks.syncResult.isError = false
    mocks.syncResult.isLoading = false
    mocks.syncResult.isFetching = false
  })

  it('does not trust the cancel query string while the persisted status is pending', () => {
    mocks.searchParams = new URLSearchParams('orderCode=123456789&cancel=true&status=CANCELLED')
    mocks.syncResult.data = 'Pending'

    render(<PaymentResultPage />)

    expect(screen.getByText('Đang xử lý thanh toán')).toBeInTheDocument()
    expect(screen.queryByText('Đã hủy thanh toán')).not.toBeInTheDocument()
  })

  it('shows a safe error when PayOS does not return an order code', () => {
    mocks.searchParams = new URLSearchParams()

    render(<PaymentResultPage />)

    expect(screen.getByText('Không thể xác nhận thanh toán')).toBeInTheDocument()
  })

  it('invalidates subscription, payment and notification caches after settlement', async () => {
    mocks.syncResult.data = 'Completed'

    render(<PaymentResultPage />)

    expect(screen.getByText('Thanh toán thành công')).toBeInTheDocument()
    await waitFor(() => {
      expect(mocks.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.notifications.all,
      })
    })
  })
})
