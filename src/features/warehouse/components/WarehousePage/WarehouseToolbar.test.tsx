import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { WarehouseToolbar } from './WarehouseToolbar'

describe('WarehouseToolbar', () => {
  it('places the search input before its addon for input-group focus management', () => {
    render(
      <TooltipProvider>
        <WarehouseToolbar
          searchText=""
          isFetching={false}
          onSearchChange={vi.fn()}
          onRefresh={vi.fn()}
        />
      </TooltipProvider>
    )

    const searchInput = screen.getByRole('textbox')

    expect(searchInput.parentElement?.firstElementChild).toBe(searchInput)
  })

  it('explains the icon-only refresh action with a tooltip', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <WarehouseToolbar
          searchText=""
          isFetching={false}
          onSearchChange={vi.fn()}
          onRefresh={vi.fn()}
        />
      </TooltipProvider>
    )

    await user.hover(screen.getByRole('button', { name: 'Làm mới danh sách kho' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Làm mới danh sách kho')
  })
})
