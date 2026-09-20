import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StockIssueWorkspaceNavigation } from './StockIssueWorkspaceNavigation'

const permissions = ['stock-issue-requests:view', 'goods-return-requests:view']

describe('StockIssueWorkspaceNavigation', () => {
  it('shows the current view as a distinct filled navigation item', () => {
    render(
      <StockIssueWorkspaceNavigation currentView="goodsReturnRequests" permissions={permissions} />
    )

    const activeLink = screen.getByRole('link', { name: 'Trả hàng' })
    const inactiveLink = screen.getByRole('link', { name: 'Xuất kho' })

    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(activeLink).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(activeLink).not.toHaveClass('border-b-2')
    expect(inactiveLink).not.toHaveAttribute('aria-current')
    expect(inactiveLink).toHaveClass('border-transparent')
  })
})
