import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { P } from '@/config/permissionCodes'
import { APP_ROUTES } from '@/routes/app-routes'
import { StockIssueWorkspaceNavigation } from './StockIssueWorkspaceNavigation'

describe('StockIssueWorkspaceNavigation', () => {
  it.each(['stockIssueRequests', 'goodsReturnRequests'] as const)(
    'keeps one active route and the shared underline navigation at %s',
    (currentView) => {
      render(
        <StockIssueWorkspaceNavigation
          currentView={currentView}
          permissions={[P.STOCK_ISSUE_REQUESTS_VIEW, P.GOODS_RETURN_REQUESTS_VIEW]}
        />
      )
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'data-slot',
        'operational-workspace-navigation'
      )
      const links = screen.getAllByRole('link')
      expect(links.map((link) => link.getAttribute('href'))).toEqual([
        APP_ROUTES.stockIssueRequests,
        APP_ROUTES.goodsReturnRequests,
      ])
      expect(links.filter((link) => link.getAttribute('aria-current') === 'page')).toEqual([
        screen.getByRole('link', {
          name: currentView === 'stockIssueRequests' ? 'Xuất kho' : 'Trả hàng',
        }),
      ])
    }
  )

  it('does not expose links without the matching view permission', () => {
    const view = render(
      <StockIssueWorkspaceNavigation currentView="stockIssueRequests" permissions={[]} />
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    view.rerender(
      <StockIssueWorkspaceNavigation
        currentView="goodsReturnRequests"
        permissions={[P.GOODS_RETURN_REQUESTS_VIEW]}
      />
    )
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Trả hàng' })).toHaveAttribute('aria-current', 'page')
  })
})
