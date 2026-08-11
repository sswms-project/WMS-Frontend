import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WarehousePagination } from './WarehousePagination'

describe('WarehousePagination', () => {
  it('renders the shadcn pagination navigation landmark', () => {
    render(<WarehousePagination page={2} pageSize={10} totalCount={25} onPageChange={vi.fn()} />)

    expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument()
  })

  it.each([
    { page: 1, totalCount: 0, range: '0-0 trên 0', previousDisabled: true, nextDisabled: true },
    { page: 1, totalCount: 1, range: '1-1 trên 1', previousDisabled: true, nextDisabled: true },
    {
      page: 1,
      totalCount: 10,
      range: '1-10 trên 10',
      previousDisabled: true,
      nextDisabled: true,
    },
    {
      page: 1,
      totalCount: 11,
      range: '1-10 trên 11',
      previousDisabled: true,
      nextDisabled: false,
    },
    {
      page: 2,
      totalCount: 15,
      range: '11-15 trên 15',
      previousDisabled: false,
      nextDisabled: true,
    },
  ])(
    'renders the correct range and boundaries for $totalCount records',
    ({ page, totalCount, range, previousDisabled, nextDisabled }) => {
      render(
        <WarehousePagination
          page={page}
          pageSize={10}
          totalCount={totalCount}
          onPageChange={vi.fn()}
        />
      )

      expect(screen.getByText(range)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Go to previous page' })).toHaveAttribute(
        'aria-disabled',
        String(previousDisabled)
      )
      expect(screen.getByRole('link', { name: 'Go to next page' })).toHaveAttribute(
        'aria-disabled',
        String(nextDisabled)
      )
    }
  )

  it('navigates once when the next page is available', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <WarehousePagination page={1} pageSize={10} totalCount={15} onPageChange={onPageChange} />
    )

    await user.click(screen.getByRole('link', { name: 'Go to next page' }))

    expect(onPageChange).toHaveBeenCalledOnce()
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('blocks pagination while the next page is loading', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <WarehousePagination
        page={1}
        pageSize={10}
        totalCount={15}
        isPending
        onPageChange={onPageChange}
      />
    )

    expect(screen.getByRole('navigation', { name: 'pagination' })).toHaveAttribute(
      'aria-busy',
      'true'
    )
    await user.click(screen.getByRole('link', { name: 'Go to next page' }))

    expect(onPageChange).not.toHaveBeenCalled()
  })
})
