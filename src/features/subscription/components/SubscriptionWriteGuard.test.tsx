import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubscriptionWriteGuard } from './SubscriptionWriteGuard'

const state = vi.hoisted(() => ({
  pathname: '/warehouses',
  isReadOnly: true,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => state.pathname,
}))

vi.mock('./SubscriptionReadOnlyProvider', () => ({
  useSubscriptionReadOnly: () => ({
    isReadOnly: state.isReadOnly,
    isLoading: false,
    reason: state.isReadOnly ? 'Gói dịch vụ đã hết hạn.' : '',
  }),
}))

describe('SubscriptionWriteGuard', () => {
  beforeEach(() => {
    state.pathname = '/warehouses'
    state.isReadOnly = true
  })

  it('disables operational form actions while the tenant is read-only', () => {
    render(
      <SubscriptionWriteGuard>
        <button type="button">Tạo kho</button>
      </SubscriptionWriteGuard>
    )

    expect(
      screen.getByRole('group', { name: 'Nội dung nghiệp vụ ở chế độ chỉ đọc' })
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Tạo kho' })).toBeDisabled()
  })

  it('keeps subscription recovery actions enabled', () => {
    state.pathname = '/subscription'

    render(
      <SubscriptionWriteGuard>
        <button type="button">Gia hạn</button>
      </SubscriptionWriteGuard>
    )

    expect(screen.getByRole('button', { name: 'Gia hạn' })).toBeEnabled()
  })

  it('does not restrict active subscriptions', () => {
    state.isReadOnly = false

    render(
      <SubscriptionWriteGuard>
        <button type="button">Tạo kho</button>
      </SubscriptionWriteGuard>
    )

    expect(screen.getByRole('button', { name: 'Tạo kho' })).toBeEnabled()
  })
})
