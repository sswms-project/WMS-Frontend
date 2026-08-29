import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WarehouseCreateDialog } from './WarehouseCreateDialog'

describe('WarehouseCreateDialog', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('submits a valid warehouse form through its callback', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(true)

    render(
      <WarehouseCreateDialog open isPending={false} onOpenChange={vi.fn()} onSubmit={onSubmit} />
    )

    await user.type(screen.getByLabelText('Mã kho'), 'HCM-01')
    await user.type(screen.getByLabelText('Tên kho'), 'Kho Thủ Đức')
    await user.type(screen.getByLabelText('Địa chỉ'), 'Thủ Đức, Hồ Chí Minh')
    await user.click(screen.getByRole('button', { name: 'Tạo kho' }))

    expect(onSubmit).toHaveBeenCalledWith({
      warehouseCode: 'HCM-01',
      warehouseName: 'Kho Thủ Đức',
      address: 'Thủ Đức, Hồ Chí Minh',
    })
  })

  it('marks the warehouse code invalid when the server reports a duplicate code', () => {
    render(
      <WarehouseCreateDialog
        open
        isPending={false}
        warehouseCodeError="Mã kho đã tồn tại."
        onOpenChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(false)}
      />
    )

    expect(screen.getByLabelText('Mã kho')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Mã kho đã tồn tại.')).toBeInTheDocument()
  })

  it('disables form actions while a create request is pending', () => {
    render(<WarehouseCreateDialog open isPending onOpenChange={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Tạo kho' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled()
  })

  it('uses code and address input metadata appropriate for warehouse data', () => {
    render(
      <WarehouseCreateDialog open isPending={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />
    )

    expect(screen.getByLabelText('Mã kho')).toHaveAttribute('spellcheck', 'false')
    expect(screen.getByLabelText('Địa chỉ')).toHaveAttribute('autocomplete', 'street-address')
  })

  it('resets form values after a successful submit', async () => {
    const user = userEvent.setup()

    render(
      <WarehouseCreateDialog
        open
        isPending={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(true)}
      />
    )

    const warehouseCode = screen.getByLabelText('Mã kho')
    await user.type(warehouseCode, 'HCM-01')
    await user.type(screen.getByLabelText('Tên kho'), 'Kho Thủ Đức')
    await user.click(screen.getByRole('button', { name: 'Tạo kho' }))

    await waitFor(() => expect(warehouseCode).toHaveValue(''))
  })

  it('keeps a draft when the dialog closes and opens again', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <WarehouseCreateDialog
        open
        isPending={false}
        onOpenChange={onOpenChange}
        onSubmit={vi.fn().mockResolvedValue(false)}
      />
    )

    const warehouseCode = screen.getByLabelText('Mã kho')
    const warehouseName = screen.getByLabelText('Tên kho')
    const warehouseAddress = screen.getByLabelText('Địa chỉ')
    await user.type(warehouseCode, 'HCM-01')
    await user.type(warehouseName, 'Kho Thá»§ Äá»©c')
    await user.type(warehouseAddress, 'Thá»§ Äá»©c, Há»“ ChÃ­ Minh')
    const cancelButton = screen.getByRole('button', { name: 'Hủy' })
    await user.click(cancelButton)

    rerender(
      <WarehouseCreateDialog
        open={false}
        isPending={false}
        onOpenChange={onOpenChange}
        onSubmit={vi.fn().mockResolvedValue(false)}
      />
    )
    rerender(
      <WarehouseCreateDialog
        open
        isPending={false}
        onOpenChange={onOpenChange}
        onSubmit={vi.fn().mockResolvedValue(false)}
      />
    )

    const restoredWarehouseCode = screen.getByLabelText('Mã kho')
    const restoredWarehouseName = screen.getByLabelText('Tên kho')
    const restoredWarehouseAddress = screen.getByLabelText('Địa chỉ')
    expect(restoredWarehouseCode).toHaveValue('HCM-01')
    expect(restoredWarehouseName).toHaveValue('Kho Thá»§ Äá»©c')
    expect(restoredWarehouseAddress).toHaveValue('Thá»§ Äá»©c, Há»“ ChÃ­ Minh')
  })

  it('restores a draft after the form mounts again', async () => {
    const user = userEvent.setup()
    const props = {
      open: true,
      isPending: false,
      onOpenChange: vi.fn(),
      onSubmit: vi.fn().mockResolvedValue(false),
    }
    const firstRender = render(<WarehouseCreateDialog {...props} />)

    const warehouseCode = screen.getByLabelText('Mã kho')
    const warehouseName = screen.getByLabelText('Tên kho')
    await user.type(warehouseCode, 'HCM-01')
    await user.type(warehouseName, 'Kho Thá»§ Äá»©c')
    firstRender.unmount()

    render(<WarehouseCreateDialog {...props} />)

    const restoredWarehouseCode = screen.getByLabelText('Mã kho')
    const restoredWarehouseName = screen.getByLabelText('Tên kho')
    expect(restoredWarehouseCode).toHaveValue('HCM-01')
    expect(restoredWarehouseName).toHaveValue('Kho Thá»§ Äá»©c')
  })
})
