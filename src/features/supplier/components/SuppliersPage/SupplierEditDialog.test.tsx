import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { SupplierEditDialog } from './SupplierEditDialog'

afterEach(cleanup)

it('renders the Vietnamese inline code error instead of blocking submit with native validation', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(
    <SupplierEditDialog
      open
      supplier={null}
      isPending={false}
      onOpenChange={vi.fn()}
      onSubmit={onSubmit}
    />
  )
  const code = screen.getByLabelText('Mã nhà cung cấp *')
  await user.type(code, 'NCC000001')
  await user.type(screen.getByLabelText('Tên nhà cung cấp *'), 'Nhà cung cấp QA')
  await user.clear(code)
  await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
  expect(await screen.findByText('Mã nhà cung cấp là bắt buộc.')).toBeVisible()
  expect(code).toHaveAttribute('aria-invalid', 'true')
  expect(code).toHaveAccessibleDescription('Mã nhà cung cấp là bắt buộc.')
  expect(code).toHaveFocus()
  expect(onSubmit).not.toHaveBeenCalled()
})
