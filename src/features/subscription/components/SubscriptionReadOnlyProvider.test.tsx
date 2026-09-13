import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubscriptionReadOnlyBanner } from './SubscriptionReadOnlyBanner'
import {
  SubscriptionReadOnlyProvider,
  useSubscriptionReadOnly,
} from './SubscriptionReadOnlyProvider'

const { currentUser, subscriptionQuery } = vi.hoisted(() => ({
  currentUser: {
    value: { role: 'Tenant Owner' },
  },
  subscriptionQuery: vi.fn(),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { role: string } | null }) => unknown) =>
    selector({ user: currentUser.value }),
}))

vi.mock('../hooks/use-subscription', () => ({
  useCurrentSubscriptionQuery: (...args: unknown[]) => subscriptionQuery(...args),
}))

function ReadOnlyStatus() {
  const { isLoading, isReadOnly, reason } = useSubscriptionReadOnly()

  return <output>{`${isReadOnly}-${isLoading}-${reason}`}</output>
}

describe('SubscriptionReadOnlyProvider', () => {
  beforeEach(() => {
    currentUser.value = { role: 'Tenant Owner' }
    subscriptionQuery.mockReturnValue({
      data: { isExpired: true },
      isLoading: false,
    })
  })

  it('places an expired tenant owner in read-only mode and presents a renewal banner', () => {
    render(
      <SubscriptionReadOnlyProvider>
        <ReadOnlyStatus />
        <SubscriptionReadOnlyBanner />
      </SubscriptionReadOnlyProvider>
    )

    expect(screen.getAllByText(/Gói dịch vụ đã hết hạn/)).toHaveLength(2)
    expect(screen.getByRole('alert')).toHaveTextContent('Tenant đang ở chế độ chỉ đọc')
    expect(screen.getByRole('link', { name: 'Gia hạn ngay' })).toHaveAttribute(
      'href',
      '/subscription'
    )
  })

  it('keeps warehouse users read-only when their tenant subscription is expired', () => {
    currentUser.value = { role: 'Warehouse Manager' }

    render(
      <SubscriptionReadOnlyProvider>
        <ReadOnlyStatus />
        <SubscriptionReadOnlyBanner />
      </SubscriptionReadOnlyProvider>
    )

    expect(screen.getByRole('status')).toHaveTextContent('true-false-Gói dịch vụ đã hết hạn')
    expect(screen.getByRole('alert')).toHaveTextContent('Tenant đang ở chế độ chỉ đọc')
    expect(screen.queryByRole('link', { name: 'Gia hạn ngay' })).not.toBeInTheDocument()
  })

  it('defaults to unrestricted outside the provider', () => {
    render(<ReadOnlyStatus />)

    expect(screen.getByRole('status')).toHaveTextContent('false-false-')
  })
})
