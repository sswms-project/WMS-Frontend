import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InventoryWorkspaceNavigation } from './InventoryWorkspaceNavigation'

const permissions = ['inventory:view', 'cycle-counts:view', 'stock-adjustments:view']
const scrollIntoView = vi.fn()

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  value: scrollIntoView,
})

describe('InventoryWorkspaceNavigation', () => {
  it('shows the current view as a distinct filled navigation item', () => {
    render(<InventoryWorkspaceNavigation currentView="abc" permissions={permissions} />)

    const activeLink = screen.getByRole('link', { name: 'Phân loại ABC' })
    const inactiveLink = screen.getByRole('link', { name: 'Tồn kho khả dụng' })

    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(activeLink).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(activeLink).not.toHaveClass('border-b-2')
    expect(inactiveLink).not.toHaveAttribute('aria-current')
    expect(inactiveLink).toHaveClass('border-transparent')
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
  })
})
