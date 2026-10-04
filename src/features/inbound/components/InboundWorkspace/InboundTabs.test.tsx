import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APP_ROUTES } from '@/routes/app-routes'
import { InboundTabs } from './InboundTabs'

const state = vi.hoisted(() => ({
  pathname: '/inbound-requests',
}))

vi.mock('next/navigation', () => ({
  usePathname: () => state.pathname,
}))

describe('InboundTabs', () => {
  beforeEach(() => {
    state.pathname = APP_ROUTES.inboundRequests
  })

  it('shows all inbound operations allowed by the current permissions', () => {
    render(<InboundTabs canViewRequests canViewReceipts />)

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
    const view = render(<InboundTabs canViewRequests canViewReceipts={false} />)

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Yêu cầu nhập kho' })).toBeInTheDocument()

    view.rerender(<InboundTabs canViewRequests={false} canViewReceipts />)

    expect(screen.queryByRole('link', { name: 'Yêu cầu nhập kho' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('hides all operations until view capabilities are available', () => {
    render(<InboundTabs canViewRequests={false} canViewReceipts={false} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it.each([
    [APP_ROUTES.inbound, 'Chờ nhận hàng'],
    [APP_ROUTES.goodsReceipts, 'Phiếu nhận hàng'],
    [APP_ROUTES.inboundPutaway, 'Chờ cất hàng'],
  ])('marks only the matching operation active at %s', (pathname, name) => {
    state.pathname = pathname
    render(<InboundTabs canViewRequests canViewReceipts />)

    const activeLinks = screen
      .getAllByRole('link')
      .filter((link) => link.hasAttribute('aria-current'))
    expect(activeLinks).toEqual([screen.getByRole('link', { name })])
  })
})
