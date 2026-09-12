import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AiCard } from '../../types/ai-assistant.types'
import { AiActionConfirmationCard } from './AiActionConfirmationCard'
import { AiNavigationCard } from './AiNavigationCard'

const actionCard: AiCard = {
  type: 'action_confirmation',
  draftId: 'draft-1',
  action: 'create_purchase_order',
  summary: 'Tạo đơn mua 200 chai SKU-001 từ ACME cho Kho Hà Nội',
  details: [
    { label: 'Kho nhận', value: 'Kho Hà Nội (WH-HN)' },
    { label: 'SKU-001 · Nước suối', value: '200 chai' },
  ],
  expiresAt: '2026-09-12T08:15:00Z',
}

function renderActionCard(overrides: Partial<Parameters<typeof AiActionConfirmationCard>[0]> = {}) {
  const props = {
    card: actionCard,
    status: 'Pending' as const,
    resultEntityId: null,
    isProcessing: false,
    isLocked: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    onNavigate: vi.fn(),
    ...overrides,
  }
  render(<AiActionConfirmationCard {...props} />)
  return props
}

describe('AiActionConfirmationCard', () => {
  it('shows the draft and lets the user confirm or cancel it', async () => {
    const user = userEvent.setup()
    const props = renderActionCard()

    expect(screen.getByText(actionCard.summary ?? '')).toBeInTheDocument()
    expect(screen.getByText('Chờ xác nhận')).toBeInTheDocument()
    expect(screen.getByText('200 chai')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))
    await user.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(props.onConfirm).toHaveBeenCalledWith('draft-1')
    expect(props.onCancel).toHaveBeenCalledWith('draft-1')
  })

  it('locks both actions while any draft is being processed', () => {
    renderActionCard({ isProcessing: true, isLocked: true })

    // While processing, the confirm button also announces its loading spinner.
    expect(screen.getByRole('button', { name: /Xác nhận/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled()
  })

  it('links to the created purchase order once executed', () => {
    renderActionCard({ status: 'Executed', resultEntityId: 'po-1' })

    expect(screen.getByText('Đã thực hiện')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xác nhận' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem đơn mua' })).toHaveAttribute(
      'href',
      '/purchase-orders/po-1'
    )
  })

  it('shows no actions for a cancelled draft', () => {
    renderActionCard({ status: 'Cancelled' })

    expect(screen.getByText('Đã hủy')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('AiNavigationCard', () => {
  it('links to the in-app page from the route map', () => {
    render(
      <AiNavigationCard
        card={{
          type: 'navigation_card',
          routeKey: 'inventory',
          title: 'Tồn kho',
          description: 'Số lượng tồn theo sản phẩm',
          actionUrl: '/inventory',
          icon: 'package-search',
        }}
        onNavigate={vi.fn()}
      />
    )

    expect(screen.getByRole('link', { name: /Tồn kho/ })).toHaveAttribute('href', '/inventory')
  })

  it.each(['https://evil.example.com', '//evil.example.com', 'javascript:alert(1)'])(
    'renders nothing for the unsafe url %s',
    (actionUrl) => {
      const { container } = render(
        <AiNavigationCard
          card={{ type: 'navigation_card', title: 'X', actionUrl }}
          onNavigate={vi.fn()}
        />
      )

      expect(container).toBeEmptyDOMElement()
    }
  )
})
