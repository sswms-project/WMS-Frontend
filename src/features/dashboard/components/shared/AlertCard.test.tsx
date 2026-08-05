import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AlertCard } from './AlertCard'

describe('AlertCard', () => {
  it('does not invoke a disabled read-only action', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <TooltipProvider>
        <AlertCard
          type="info"
          title="Suggested inbound"
          description="Create a replenishment request"
          actionLabel="Receive inventory"
          onAction={onAction}
          disabled
          disabledReason="Subscription đã hết hạn"
        />
      </TooltipProvider>
    )

    const action = screen.getByRole('button', { name: 'Receive inventory' })
    expect(action).toBeDisabled()

    await user.click(action)

    expect(onAction).not.toHaveBeenCalled()
  })

  it('keeps an unguarded action clickable', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <TooltipProvider>
        <AlertCard
          type="warning"
          title="Attention"
          description="Review this location"
          actionLabel="Open location"
          onAction={onAction}
        />
      </TooltipProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Open location' }))

    expect(onAction).toHaveBeenCalledOnce()
  })
})
