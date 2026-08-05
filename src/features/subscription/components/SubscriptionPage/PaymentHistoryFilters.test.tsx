import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PaymentHistoryFilters } from './PaymentHistoryFilters'
import type { PaymentHistoryFilterState } from '../../types/subscription.types'

const defaultFilters: PaymentHistoryFilterState = {
  searchText: '',
  planId: 'all',
  status: 'all',
}

describe('PaymentHistoryFilters', () => {
  it('submits the controlled filter value and resets through its callbacks', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSubmit = vi.fn()
    const onReset = vi.fn()

    render(<FilterHarness onChange={onChange} onSubmit={onSubmit} onReset={onReset} />)

    await user.type(screen.getByLabelText('Mã hóa đơn'), 'INV-002')
    await user.click(screen.getByRole('button', { name: 'Lọc' }))
    await user.click(screen.getByRole('button', { name: 'Đặt lại bộ lọc' }))

    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, searchText: 'INV-002' })
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onReset).toHaveBeenCalledOnce()
  })
})

interface FilterHarnessProps {
  readonly onChange: (value: PaymentHistoryFilterState) => void
  readonly onSubmit: () => void
  readonly onReset: () => void
}

function FilterHarness({ onChange, onSubmit, onReset }: FilterHarnessProps) {
  const [filters, setFilters] = useState(defaultFilters)

  return (
    <PaymentHistoryFilters
      plans={[]}
      value={filters}
      onChange={(value) => {
        setFilters(value)
        onChange(value)
      }}
      onSubmit={onSubmit}
      onReset={onReset}
    />
  )
}
