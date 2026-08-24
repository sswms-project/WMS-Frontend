import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BillingCycleToggle } from './BillingCycleToggle'

describe('BillingCycleToggle', () => {
  it('selects a billing cycle and does not allow an empty selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <BillingCycleToggle value="Monthly" yearlySavingPercent={15} onValueChange={onValueChange} />
    )

    const monthlyOption = screen.getByRole('radio', { name: 'Thanh toán hàng tháng' })
    const yearlyOption = screen.getByRole('radio', { name: 'Thanh toán hàng năm' })

    expect(monthlyOption).toHaveAttribute('data-state', 'on')
    expect(screen.getByText('-15%')).toBeInTheDocument()

    await user.click(yearlyOption)
    expect(onValueChange).toHaveBeenCalledWith('Yearly')

    await user.click(monthlyOption)
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })
})
