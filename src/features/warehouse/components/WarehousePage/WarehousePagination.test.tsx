import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WarehousePagination } from './WarehousePagination'

describe('WarehousePagination', () => {
  it('renders the shadcn pagination navigation landmark', () => {
    render(<WarehousePagination page={2} pageSize={10} totalCount={25} onPageChange={vi.fn()} />)

    expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument()
  })
})
