import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import type {
  RecordStockPickingFormValues,
  CreateGoodsReturnRequestFormValues,
} from '../../schemas/stock-issue.schema'
import type { StockIssueRequestSummary } from '../../types/stock-issue.types'
import { RecordStockPickingDialog } from './RecordStockPickingDialog'
import { CreateGoodsReturnRequestDialog } from './CreateGoodsReturnRequestDialog'

const order: StockIssueRequestSummary = {
  id: 'order-1',
  stockIssueRequestCode: 'OUT-001',
  stockRecipientId: 'stockRecipient-1',
  stockRecipientName: 'Đơn vị nhận hàng A',
  recipientCode: 'CUS-01',
  warehouseId: 'warehouse-1',
  warehouseName: 'Kho trung tâm',
  purpose: null,
  recipientName: 'Người nhận',
  recipientPhone: '0900000000',
  recipientEmail: null,
  recipientAddress: 'Đà Nẵng',
  status: 'Picking',
  createdAt: '2026-09-16T00:00:00Z',
  dispatchAuthorizedByUserId: null,
  dispatchAuthorizedAt: null,
  dispatchedAt: null,
  items: [],
}

function IssueDialogFixture() {
  const form = useForm<RecordStockPickingFormValues>({
    defaultValues: {
      lines: [
        {
          stockIssueRequestItemId: 'item-1',
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
    <RecordStockPickingDialog
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

function GoodsReturnRequestDialogFixture() {
  const form = useForm<CreateGoodsReturnRequestFormValues>({
    defaultValues: {
      reason: 'Khách trả hàng',
      lines: [
        {
          stockIssuePickDetailId: 'pick-1',
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
    <CreateGoodsReturnRequestDialog
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
    render(<GoodsReturnRequestDialogFixture />)
    expect(screen.getByRole('combobox', { name: 'Vị trí nhập lại' })).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Tình trạng'), 'Scrap')

    expect(screen.queryByRole('combobox', { name: 'Vị trí nhập lại' })).not.toBeInTheDocument()
  })
})
