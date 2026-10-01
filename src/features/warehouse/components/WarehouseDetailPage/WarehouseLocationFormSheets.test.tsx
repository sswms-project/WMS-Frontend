import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ZoneFormSheet } from './WarehouseLocationFormSheets'

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
    expect(screen.getByLabelText('Dung lượng lưu trữ')).toHaveValue(1_000)
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
