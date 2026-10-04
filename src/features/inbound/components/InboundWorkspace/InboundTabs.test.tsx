import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { P } from '@/config/permissionCodes'
import { APP_ROUTES } from '@/routes/app-routes'
import { InboundTabs } from './InboundTabs'

const state = vi.hoisted(() => ({
  pathname: '/inbound-requests',
  permissions: [] as string[],
}))

vi.mock('next/navigation', () => ({
  usePathname: () => state.pathname,
}))

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useMeQuery: () => ({ data: { permissions: state.permissions } }),
}))

describe('InboundTabs', () => {
  beforeEach(() => {
    state.pathname = APP_ROUTES.inboundRequests
    state.permissions = []
  })

  it('shows all inbound operations allowed by the current permissions', () => {
    state.permissions = [P.INBOUND_REQUESTS_VIEW, P.GOODS_RECEIPTS_VIEW]

    render(<InboundTabs />)

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Yêu cầu nhập kho',
      'Chờ nhận hàng',
      'Phiếu nhận hàng',
      'Chờ cất hàng',
    ])
    expect(screen.getByRole('link', { name: 'Yêu cầu nhập kho' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('hides request and receipt operations independently', () => {
    state.permissions = [P.INBOUND_REQUESTS_VIEW]
    const view = render(<InboundTabs />)

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Yêu cầu nhập kho' })).toBeInTheDocument()

    state.permissions = [P.GOODS_RECEIPTS_VIEW]
    view.rerender(<InboundTabs />)

    expect(screen.queryByRole('link', { name: 'Yêu cầu nhập kho' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })
})
