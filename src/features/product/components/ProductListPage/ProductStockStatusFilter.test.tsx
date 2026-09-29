import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProductStockStatusFilter } from './ProductStockStatusFilter'

describe('ProductStockStatusFilter', () => {
  it('renders stock counts and selects low stock', async () => {
    const onValueChange = vi.fn()
    render(
      <ProductStockStatusFilter
        value=""
        counts={{ all: 12, lowStock: 3, outOfStock: 1 }}
        onValueChange={onValueChange}
      />
    )

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Sắp hết hàng 3 sản phẩm' }))

    expect(onValueChange).toHaveBeenCalledWith('LowStock')
  })

  it('uses the shared active palette for the selected out-of-stock count', () => {
    render(
      <ProductStockStatusFilter
        value="OutOfStock"
        counts={{ all: 12, lowStock: 3, outOfStock: 1 }}
        onValueChange={vi.fn()}
      />
    )

    expect(screen.getByText('1')).toHaveClass('bg-primary-foreground/15', 'text-primary-foreground')
    expect(screen.getByText('1')).not.toHaveClass('text-destructive')
  })
})
