import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InboundTabs } from './InboundTabs'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('InboundTabs', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/inbound/receipts')
  })

  it('shows the current workflow as a distinct filled navigation item', () => {
    render(<InboundTabs />)

    const activeLink = screen.getByRole('link', { name: 'Phiếu nhập' })
    const inactiveLink = screen.getByRole('link', { name: 'Chờ nhận hàng' })

    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(activeLink).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(activeLink).not.toHaveClass('border-b-2')
    expect(inactiveLink).not.toHaveAttribute('aria-current')
    expect(inactiveLink).toHaveClass('border-transparent')
  })
})
