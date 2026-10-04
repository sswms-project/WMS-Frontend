import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFieldArray, useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PutawayFormValues } from '../../schemas/inbound.schema'
import type { GoodsReceiptDetail } from '../../types/inbound.types'
import { PutawayForm, type SlotOption } from './PutawayForm'

const baseUnitId = '10000000-0000-4000-8000-000000000003'
const cartonUnitId = '10000000-0000-4000-8000-000000000004'
const itemId = '10000000-0000-4000-8000-000000000002'
const slotId = '10000000-0000-4000-8000-000000000001'
const receipt: GoodsReceiptDetail = {
  id: 'receipt',
  receiptCode: 'GR-QA',
  inboundRequestId: 'request',
  inboundRequestCode: 'IR-QA',
  warehouseId: 'warehouse',
  warehouseName: 'Kho QA',
  warehouseCode: 'QA',
  status: 'Approved',
  createdBy: 'staff',
  createdByName: 'QA',
  createdAt: '',
  approvedBy: null,
  approvedByName: null,
  modifiedAt: null,
  submittedAt: null,
  approvedAt: null,
  rejectionReason: null,
  arrivalConfirmedBy: null,
  arrivalConfirmedAt: null,
  receivingAssignedTo: null,
  receivingAssignedToName: null,
  putAwayAssignedTo: 'staff',
  putAwayAssignedToName: 'QA',
  putAwayAssignedAt: null,
  putAwayTaskExecutionStatus: 'Queued',
  putAwayTaskCancelledAt: null,
  putAwayTaskCancellationReason: null,
  putAwayTaskRequiresReconciliation: false,
  putAwayTaskReconciledAt: null,
  putAwayTaskReconciliationNote: null,
  version: 'AQ==',
  history: [],
  items: [
    {
      id: itemId,
      inboundRequestItemId: 'request-item',
      productId: 'product',
      productSKU: 'BEER',
      productName: 'Bia',
      baseUnitId,
      baseUnitName: 'Lon',
      enteredUnitId: cartonUnitId,
      conversionFactorSnapshot: 24,
      allowedUnits: [
        {
          unitId: baseUnitId,
          unitName: 'Lon',
          unitCode: 'LON',
          quantityPrecision: 0,
          conversionFactor: 1,
        },
        {
          unitId: cartonUnitId,
          unitName: 'Thùng',
          unitCode: 'THUNG',
          quantityPrecision: 0,
          conversionFactor: 24,
        },
      ],
      lotId: null,
      lotNumber: null,
      manufacturedDate: null,
      expiryDate: null,
      orderedQuantity: 240,
      receivedQuantity: 240,
      damagedQuantity: 0,
      usableQuantity: 240,
      putAwayQuantity: 0,
      remainingPutAwayQuantity: 240,
      exceptionReason: null,
      putAwayDetails: [],
    },
  ],
}
const slots: SlotOption[] = [
  {
    id: slotId,
    code: 'A01',
    name: 'A01',
    zoneId: 'zone',
    zoneLabel: 'Khu A',
    hierarchy: 'Khu A / A01',
    capacityLabel: '8 / 20 Thùng',
    allowsMixedProducts: true,
  },
]

afterEach(cleanup)

function TestForm({
  pending = false,
  uncertain = false,
  remaining = 240,
  unitsAvailable = true,
  onSubmit = vi.fn(),
}: {
  readonly pending?: boolean
  readonly uncertain?: boolean
  readonly remaining?: number
  readonly unitsAvailable?: boolean
  readonly onSubmit?: (values: PutawayFormValues) => void
}) {
  const form = useForm<PutawayFormValues>({
    defaultValues: {
      lines: [
        { goodsReceiptItemId: itemId, slotId, enteredQuantity: 4, enteredUnitId: cartonUnitId },
      ],
    },
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
  return (
    <PutawayForm
      receipt={{
        ...receipt,
        items: receipt.items.map((item) => ({
          ...item,
          remainingPutAwayQuantity: remaining,
          allowedUnits: unitsAvailable ? item.allowedUnits : [],
        })),
      }}
      form={form}
      fields={fieldArray.fields}
      slots={slots}
      isPending={pending}
      hasUncertainSubmission={uncertain}
      canCancel={false}
      onAdd={() =>
        fieldArray.append({
          goodsReceiptItemId: '',
          slotId: '',
          enteredQuantity: 1,
          enteredUnitId: '',
        })
      }
      onRemove={fieldArray.remove}
      onCancel={vi.fn()}
      onSubmit={() => onSubmit(form.getValues())}
    />
  )
}

describe('put-away operational-unit form', () => {
  it('locks allocation and cancellation but allows exact retry even after the remainder changes', async () => {
    const submit = vi.fn()
    const user = userEvent.setup()
    render(<TestForm uncertain remaining={0} onSubmit={submit} />)
    expect(screen.getByLabelText('Số lượng cất')).toBeDisabled()
    expect(screen.getByLabelText('Đơn vị cất')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Chia sang vị trí khác' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Xóa phân bổ 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Quay lại danh sách' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    await user.click(screen.getByRole('button', { name: 'Gửi lại an toàn' }))
    expect(submit).toHaveBeenCalledOnce()
  })
  it('shows conversion, preserves physical amount when switching unit and submits explicit entered fields', async () => {
    const user = userEvent.setup()
    const submit = vi.fn()
    render(<TestForm onSubmit={submit} />)
    expect(screen.getByText('= 96 Lon')).toBeInTheDocument()
    expect(screen.getByText('1 Thùng = 24 Lon')).toBeInTheDocument()
    expect(screen.getByLabelText('Đơn vị cất')).toHaveAccessibleDescription('1 Thùng = 24 Lon')
    await user.selectOptions(screen.getByLabelText('Đơn vị cất'), baseUnitId)
    await waitFor(() => expect(screen.getByLabelText('Số lượng cất')).toHaveValue(96))
    await user.selectOptions(screen.getByLabelText('Đơn vị cất'), cartonUnitId)
    await waitFor(() => expect(screen.getByLabelText('Số lượng cất')).toHaveValue(4))
    await user.click(screen.getByRole('button', { name: 'Xác nhận cất hàng' }))
    expect(submit).toHaveBeenCalledWith({
      lines: [
        { goodsReceiptItemId: itemId, slotId, enteredQuantity: 4, enteredUnitId: cartonUnitId },
      ],
    })
    expect(submit.mock.calls[0]?.[0].lines[0]).not.toHaveProperty('quantity')
    await user.click(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' }))
    await waitFor(() => expect(screen.getByLabelText('Số lượng cất')).toHaveValue(10))
    expect(screen.getByText('= 240 Lon')).toBeInTheDocument()
  })
  it('visibly switches to base UOM for an indivisible remainder', async () => {
    const user = userEvent.setup()
    render(<TestForm remaining={145} />)
    await user.click(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' }))
    await waitFor(() => expect(screen.getByLabelText('Đơn vị cất')).toHaveValue(baseUnitId))
    expect(screen.getByLabelText('Số lượng cất')).toHaveValue(145)
    expect(screen.getByText('= 145 Lon')).toBeInTheDocument()
  })
  it('blocks an over-allocation and prevents editing during submission', async () => {
    const user = userEvent.setup()
    const result = render(<TestForm />)
    const input = screen.getByLabelText('Số lượng cất')
    await user.clear(input)
    await user.type(input, '11')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Xác nhận cất hàng' })).toBeDisabled()
    )
    expect(input).toHaveAttribute('aria-invalid', 'true')
    result.unmount()
    render(<TestForm pending />)
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toBeDisabled()
    expect(screen.getByLabelText('Số lượng cất')).toBeDisabled()
    expect(screen.getByLabelText('Đơn vị cất')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' })).toBeDisabled()
  })
  it('supports keyboard focus and filling the remaining quantity without a pointer', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    screen.getByLabelText('Số lượng cất').focus()
    await user.tab()
    expect(screen.getByLabelText('Đơn vị cất')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Số lượng cất')).toHaveValue(10)
    expect(screen.getByText('= 240 Lon')).toHaveAttribute('aria-live', 'polite')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Xóa phân bổ 1' })).toHaveFocus()
  })
  it('requires correction instead of rounding when the chosen unit cannot represent the physical quantity', async () => {
    const user = userEvent.setup()
    render(<TestForm remaining={145} />)
    await user.click(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' }))
    await user.selectOptions(screen.getByLabelText('Đơn vị cất'), cartonUnitId)
    expect(screen.getByLabelText('Đơn vị cất')).toHaveValue(cartonUnitId)
    expect(screen.getByLabelText('Số lượng cất')).toHaveValue(null)
    expect(screen.getByRole('button', { name: 'Xác nhận cất hàng' })).toBeDisabled()
    expect(screen.getByLabelText('Số lượng cất')).toHaveAttribute('aria-invalid', 'true')
    await user.click(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' }))
    expect(screen.getByLabelText('Đơn vị cất')).toHaveValue(baseUnitId)
    expect(screen.getByLabelText('Số lượng cất')).toHaveValue(145)
    expect(screen.getByRole('button', { name: 'Xác nhận cất hàng' })).toBeEnabled()
  })
  it('keeps the first allocation when adding and removing an incomplete split', async () => {
    const user = userEvent.setup()
    const submit = vi.fn()
    render(<TestForm onSubmit={submit} />)
    await user.click(screen.getByRole('button', { name: 'Chia sang vị trí khác' }))
    expect(screen.getAllByLabelText('Số lượng cất')).toHaveLength(2)
    expect(screen.getAllByLabelText('Số lượng cất')[0]).toHaveValue(4)
    expect(screen.getByRole('button', { name: 'Xác nhận cất hàng' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Xóa phân bổ 2' }))
    expect(screen.getAllByLabelText('Số lượng cất')).toHaveLength(1)
    expect(screen.getByLabelText('Số lượng cất')).toHaveValue(4)
    await user.click(screen.getByRole('button', { name: 'Xác nhận cất hàng' }))
    expect(submit).toHaveBeenCalledWith({
      lines: [
        { goodsReceiptItemId: itemId, slotId, enteredQuantity: 4, enteredUnitId: cartonUnitId },
      ],
    })
  })
  it('explains unavailable unit metadata and never allows a guessed base-unit submission', () => {
    render(<TestForm unitsAvailable={false} />)
    expect(screen.getByRole('button', { name: 'Xác nhận cất hàng' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cất toàn bộ còn lại' })).toBeDisabled()
    expect(screen.getByLabelText('Đơn vị cất')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Đơn vị cất')).toHaveAccessibleDescription(
      'Đơn vị cất không khả dụng. Vui lòng tải lại dữ liệu hoặc chọn đơn vị khác.'
    )
  })
})
