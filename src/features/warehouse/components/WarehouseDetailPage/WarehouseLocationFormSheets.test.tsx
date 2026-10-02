import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { RackFormSheet, SlotFormSheet, ZoneFormSheet } from './WarehouseLocationFormSheets'
import { EMPTY_WAREHOUSE_PHYSICAL_DETAILS } from '../../utils/warehouse-physical-details'
import type { UnitResponse } from '@/features/product/types/product.types'

const unit: UnitResponse = {
  id: '10000000-0000-4000-8000-000000000001',
  unitCode: 'THUNG',
  unitName: 'Thùng',
  symbol: null,
  quantityPrecision: 0,
  description: null,
  status: 'Active',
  createdAt: '',
  modifiedAt: null,
}
const capacityProps = {
  units: [unit],
  unitsLoading: false,
  unitsError: false,
  onRetryUnits: vi.fn(),
}
const slotValues = {
  slotCode: 'A01',
  slotName: 'Vị trí A01',
  description: '',
  allowsMixedProducts: true,
  capacityType: 'Quantity' as const,
  capacity: 20,
  capacityUnitId: unit.id,
  ...EMPTY_WAREHOUSE_PHYSICAL_DETAILS,
}

describe('WarehouseLocationFormSheets', () => {
  it('shows the shared physical detail fields when editing a location', () => {
    render(
      <ZoneFormSheet
        open
        mode="update"
        isPending={false}
        defaultValues={{
          zoneCode: 'ZONE-A',
          zoneName: 'Khu vực A',
          description: '',
          storageCapacity: 1_000,
          storageCapacityUnit: 'Kilogram',
          physicalLength: 12,
          physicalLengthUnit: 'Meter',
          physicalWidth: 8,
          physicalWidthUnit: 'Meter',
          physicalHeight: 4,
          physicalHeightUnit: 'Meter',
        }}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(true)}
      />
    )

    expect(screen.getByRole('heading', { name: 'Thông tin chi tiết' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Dung lượng lưu trữ')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Chiều dài')).toHaveValue(12)
    expect(screen.getByLabelText('Chiều rộng')).toHaveValue(8)
    expect(screen.getByLabelText('Chiều cao')).toHaveValue(4)
  })

  it('uses the same responsive right-side drawer width as the product form', () => {
    render(
      <ZoneFormSheet
        open
        mode="create"
        isPending={false}
        defaultValues={{
          zoneCode: '',
          zoneName: '',
          description: '',
          storageCapacity: null,
          storageCapacityUnit: null,
          physicalLength: null,
          physicalLengthUnit: null,
          physicalWidth: null,
          physicalWidthUnit: null,
          physicalHeight: null,
          physicalHeightUnit: null,
        }}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(true)}
      />
    )

    expect(screen.getByRole('dialog')).toHaveClass(
      'data-[side=right]:md:w-4/5',
      'data-[side=right]:lg:w-2/3',
      'data-[side=right]:xl:w-1/2',
      'overflow-hidden'
    )
    expect(document.querySelector('[data-slot="field-group"]')).toHaveClass('content-start')
  })
})

describe('location capacity fields', () => {
  const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollIntoView'
  )
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
  })
  afterAll(() => {
    if (scrollIntoViewDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollIntoViewDescriptor)
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
    }
  })
  it('confirms clearing Quantity settings and lets cancellation preserve them', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(
      <SlotFormSheet
        open
        mode="update"
        isPending={false}
        defaultValues={slotValues}
        {...capacityProps}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    async function chooseUnlimited() {
      fireEvent.keyDown(screen.getByLabelText('Loại sức chứa'), { key: 'ArrowDown' })
      fireEvent.click(await screen.findByRole('option', { name: 'Không giới hạn' }))
      await screen.findByRole('alertdialog')
    }
    await chooseUnlimited()
    fireEvent.click(screen.getByRole('button', { name: 'Giữ cấu hình' }))
    expect(screen.getByLabelText('Sức chứa tối đa')).toHaveValue(20)
    expect(onSubmit).not.toHaveBeenCalled()
    await chooseUnlimited()
    fireEvent.click(screen.getByRole('button', { name: /^Chuyển sang không giới hạn$/ }))
    expect(screen.queryByLabelText('Sức chứa tối đa')).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          capacityType: 'None',
          capacity: null,
          capacityUnitId: null,
        })
      )
    )
  })
  it('shows Quantity controls for mixed SKU and locks type/unit when stocked', () => {
    render(
      <SlotFormSheet
        open
        mode="update"
        isPending={false}
        defaultValues={slotValues}
        {...capacityProps}
        location={{
          ...slotValues,
          capacityUsed: 8,
          currentOccupancy: 192,
          remainingCapacity: 12,
          capacityUnitName: 'Thùng',
        }}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Sức chứa tối đa')).toHaveValue(20)
    expect(screen.getByLabelText('Loại sức chứa')).toBeDisabled()
    expect(screen.getByLabelText('Đơn vị sức chứa')).toBeDisabled()
    expect(screen.getByText('8 / 20')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Mức sử dụng sức chứa' })).toHaveAttribute(
      'aria-valuenow',
      '8'
    )
    fireEvent.click(screen.getByLabelText('Cho phép nhiều sản phẩm trong cùng vị trí'))
    expect(screen.getByLabelText('Sức chứa tối đa')).toHaveValue(20)
  })
  it('blocks reducing maximum below normalized usage without calling the API callback', async () => {
    const onSubmit = vi.fn()
    render(
      <SlotFormSheet
        open
        mode="update"
        isPending={false}
        defaultValues={{ ...slotValues, capacity: 7 }}
        {...capacityProps}
        location={{ ...slotValues, capacityUsed: 8, currentOccupancy: 192 }}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    await screen.findByText('Sức chứa tối đa không được thấp hơn sức chứa đã dùng.')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Sức chứa tối đa')).toHaveFocus()
  })
  it('blocks inactive/missing capacity units and keeps values in the form', async () => {
    const onSubmit = vi.fn()
    render(
      <SlotFormSheet
        open
        mode="create"
        isPending={false}
        defaultValues={slotValues}
        {...capacityProps}
        units={[{ ...unit, status: 'Inactive' }]}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))
    await screen.findByText('Vui lòng chọn đơn vị sức chứa đang hoạt động.')
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('keeps a numeric capacity after blur before submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(
      <SlotFormSheet
        open
        mode="update"
        isPending={false}
        defaultValues={slotValues}
        {...capacityProps}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    fireEvent.change(screen.getByLabelText('Sức chứa tối đa'), { target: { value: '21' } })
    fireEvent.blur(screen.getByLabelText('Sức chứa tối đa'))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ capacity: 21 }))
    )
  })
  it('hides operational fields for a SlotLevel rack', () => {
    render(
      <RackFormSheet
        open
        mode="create"
        isPending={false}
        defaultValues={{
          ...slotValues,
          rackCode: 'R01',
          rackName: 'Kệ 1',
          storageMode: 'SlotLevel',
          capacityType: 'None',
          capacity: null,
          capacityUnitId: null,
        }}
        {...capacityProps}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.queryByLabelText('Loại sức chứa')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Sức chứa tối đa')).not.toBeInTheDocument()
  })
  it('shows the legacy warning and submits explicit nulls for None while preserving hidden mass data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(
      <SlotFormSheet
        open
        mode="update"
        isPending={false}
        defaultValues={{
          ...slotValues,
          capacityType: 'None',
          capacity: null,
          capacityUnitId: null,
          storageCapacity: 100,
          storageCapacityUnit: 'Kilogram',
        }}
        {...capacityProps}
        location={{ capacityType: 'None', capacity: 20, requiresCapacityConfiguration: true }}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    expect(screen.getByText(/Cần cấu hình đơn vị sức chứa trước/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Sức chứa tối đa')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          capacityType: 'None',
          capacity: null,
          capacityUnitId: null,
          storageCapacity: 100,
          storageCapacityUnit: 'Kilogram',
        })
      )
    )
  })
})
