import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import {
  emptyStockRecipientFormValues,
  type StockRecipientFormValues,
} from '../../schemas/stock-recipient.schema'
import { StockRecipientFormDialog } from './StockRecipientFormDialog'

describe('StockRecipientFormDialog', () => {
  it('labels both customer types and confirms before discarding a dirty form', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    function TestDialog() {
      const form = useForm<StockRecipientFormValues>({
        defaultValues: emptyStockRecipientFormValues,
      })
      return (
        <StockRecipientFormDialog
          open
          title="Thêm khách hàng"
          description="Nhập thông tin khách hàng."
          form={form}
          isPending={false}
          onOpenChange={onOpenChange}
          onSubmit={vi.fn()}
        />
      )
    }

    render(<TestDialog />)

    expect(screen.getByRole('dialog')).toHaveClass('sm:max-w-5xl')
    expect(screen.getByRole('dialog')).toHaveClass('w-[calc(100vw-1rem)]')
    const organizationRadio = screen.getByRole('radio', { name: 'Tổ chức' })
    expect(organizationRadio).toBeChecked()
    expect(organizationRadio.closest('[role="group"]')).toHaveAttribute(
      'data-orientation',
      'horizontal'
    )
    expect(screen.getByRole('radio', { name: 'Cá nhân' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Tên khách hàng *'), 'Khách hàng A')
    await user.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Bỏ các thay đổi chưa lưu?')
    expect(onOpenChange).not.toHaveBeenCalledWith(false)

    await user.click(screen.getByRole('button', { name: 'Bỏ thay đổi' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
