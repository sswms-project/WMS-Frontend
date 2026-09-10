import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PaymentResultPage } from './PaymentResultPage'

const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  push: vi.fn(),
  mutationState: {
    data: undefined as string | undefined,
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => mocks.searchParams,
}))

vi.mock('../hooks/use-subscription', () => ({
  useProcessVNPayReturnMutation: () => mocks.mutationState,
}))

describe('PaymentResultPage', () => {
  beforeEach(() => {
    mocks.searchParams = new URLSearchParams('vnp_TxnRef=123456789&vnp_ResponseCode=00')
    mocks.push.mockReset()
    mocks.mutationState.data = undefined
    mocks.mutationState.isPending = false
    mocks.mutationState.isError = false
    mocks.mutationState.mutate = vi.fn()
  })

  it('shows processing while mutation is pending', () => {
    mocks.mutationState.isPending = true

    render(<PaymentResultPage />)

    expect(screen.getByText('Đang xử lý thanh toán')).toBeInTheDocument()
  })

  it('shows a safe error when VNPay does not return any params', () => {
    mocks.searchParams = new URLSearchParams()

    render(<PaymentResultPage />)

    expect(screen.getByText('Không thể xác nhận thanh toán')).toBeInTheDocument()
  })

  it('shows success when mutation returns Completed', () => {
    mocks.mutationState.data = 'Completed'

    render(<PaymentResultPage />)

    expect(screen.getByText('Thanh toán thành công')).toBeInTheDocument()
  })

  it('shows cancelled when mutation returns Failed', () => {
    mocks.mutationState.data = 'Failed'

    render(<PaymentResultPage />)

    expect(screen.getByText('Đã hủy thanh toán')).toBeInTheDocument()
  })
})
