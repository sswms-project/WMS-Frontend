import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import type { IssueStockFormValues, RecordReturnFormValues } from '../../schemas/outbound.schema'
import type { OutboundOrderSummary } from '../../types/outbound.types'
import { IssueStockDialog } from './IssueStockDialog'
import { RecordReturnDialog } from './RecordReturnDialog'

const order: OutboundOrderSummary = {
  id: 'order-1',
  orderCode: 'OUT-001',
  customerId: 'customer-1',
  customerName: 'Khách hàng A',
  customerCode: 'CUS-01',
  warehouseId: 'warehouse-1',
  warehouseName: 'Kho trung tâm',
  purpose: null,
  recipientName: 'Người nhận',
  recipientPhone: '0900000000',
  recipientEmail: null,
  recipientAddress: 'Đà Nẵng',
  status: 'Picking',
  createdAt: '2026-09-16T00:00:00Z',
  deliveredAt: null,
  failedReason: null,
  items: [],
}

function IssueDialogFixture() {
  const form = useForm<IssueStockFormValues>({
    defaultValues: {
      lines: [
        {
          outboundOrderItemId: 'item-1',
          productId: 'product-1',
          productName: 'Sản phẩm A',
          sku: 'SKU-01',
          remainingQuantity: 10,
          inventoryStockId: '',
          availableQuantity: 0,
          pickedQuantity: 0,
        },
      ],
    },
  })
  return (
    <IssueStockDialog
      order={order}
      form={form}
      isPending={false}
      inventorySearch=""
      onInventorySearchChange={vi.fn()}
      onOpenChange={vi.fn()}
      onSubmit={vi.fn()}
      inventoryOptions={[]}
    />
  )
}

function ReturnDialogFixture() {
  const form = useForm<RecordReturnFormValues>({
    defaultValues: {
      reason: 'Khách trả hàng',
      lines: [
        {
          outboundPickDetailId: 'pick-1',
          productName: 'Sản phẩm A',
          lotNumber: null,
          returnableQuantity: 2,
          quantity: 1,
          condition: 'Good',
          restockSlotId: '',
        },
      ],
    },
  })
  return (
    <RecordReturnDialog
      order={order}
      form={form}
      isPending={false}
      slotOptions={[{ id: 'slot-1', label: 'A-01-01' }]}
      allowableByPickDetail={{ 'pick-1': 2 }}
      slotSearch=""
      onSlotSearchChange={vi.fn()}
      onOpenChange={vi.fn()}
      onSubmit={vi.fn()}
    />
  )
}

describe('outbound workflow dialogs', () => {
  it('explains reservation semantics and supports splitting a line across locations', async () => {
    render(<IssueDialogFixture />)

    expect(screen.getByText('Lấy hàng & phân bổ tồn kho')).toBeInTheDocument()
    expect(screen.getByText(/tồn thực tế chỉ giảm khi hàng rời kho/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xác nhận lấy hàng' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Thêm vị trí/lô' }))
    expect(screen.getAllByRole('combobox', { name: 'Dòng tồn kho lấy Sản phẩm A' })).toHaveLength(2)
    const removeButtons = screen.getAllByRole('button', { name: 'Xóa phân bổ Sản phẩm A' })
    expect(removeButtons).toHaveLength(2)
    await userEvent.click(removeButtons[1]!)
    expect(screen.getAllByRole('combobox', { name: 'Dòng tồn kho lấy Sản phẩm A' })).toHaveLength(1)
  })

  it('does not require a restock location when returned goods are scrapped', async () => {
    render(<ReturnDialogFixture />)
    expect(screen.getByRole('combobox', { name: 'Vị trí nhập lại' })).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Tình trạng'), 'Scrap')

    expect(screen.queryByRole('combobox', { name: 'Vị trí nhập lại' })).not.toBeInTheDocument()
  })
})
