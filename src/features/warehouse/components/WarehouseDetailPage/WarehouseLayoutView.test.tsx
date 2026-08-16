import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ZoneResponse } from '@/types/warehouse'
import { TooltipProvider } from '@/components/ui/tooltip'
import { WarehouseLayoutView } from './WarehouseLayoutView'

const zones: ZoneResponse[] = [
  {
    id: 'zone-1',
    zoneCode: 'A',
    zoneName: 'Khu A',
    description: 'Hàng khô',
    status: 'Active',
    racks: [
      {
        id: 'rack-1',
        rackCode: 'A-01',
        rackName: 'Kệ A-01',
        status: 'Active',
        slots: [
          {
            id: 'slot-1',
            slotCode: 'A-01-01',
            status: 'Occupied',
            isActive: true,
            capacity: 100,
            currentOccupancy: 20,
            barcodeValue: 'A-01-01',
          },
          {
            id: 'slot-2',
            slotCode: 'A-01-02',
            status: 'Vacant',
            isActive: true,
            capacity: 100,
            currentOccupancy: 0,
            barcodeValue: 'A-01-02',
          },
          {
            id: 'slot-3',
            slotCode: 'A-01-03',
            status: 'Reserved',
            isActive: true,
            capacity: 100,
            currentOccupancy: 0,
            barcodeValue: 'A-01-03',
          },
          {
            id: 'slot-4',
            slotCode: 'A-01-04-LONG-LOCATION-CODE',
            status: 'Full',
            isActive: true,
            capacity: 100,
            currentOccupancy: 100,
            barcodeValue: 'BARCODE-A-01-04',
          },
          {
            id: 'slot-5',
            slotCode: 'A-01-05',
            status: 'Vacant',
            isActive: false,
            capacity: 50,
            currentOccupancy: 0,
            barcodeValue: 'A-01-05',
          },
        ],
      },
      {
        id: 'rack-2',
        rackCode: 'A-02',
        rackName: 'Kệ A-02',
        status: 'Active',
        slots: [],
      },
    ],
  },
  {
    id: 'zone-2',
    zoneCode: 'B',
    zoneName: 'Khu B',
    description: null,
    status: 'Inactive',
    racks: [],
  },
]

function renderLayout(overrides?: {
  selectedZoneId?: string | null
  selectedRackId?: string | null
}) {
  const callbacks = {
    onSelectZone: vi.fn(),
    onSelectRack: vi.fn(),
    onBackToZones: vi.fn(),
    onBackToRacks: vi.fn(),
    onCreateZone: vi.fn(),
    onCreateRack: vi.fn(),
    onCreateSlot: vi.fn(),
    onEditZone: vi.fn(),
    onEditRack: vi.fn(),
    onEditSlot: vi.fn(),
    onDeactivateZone: vi.fn(),
    onDeactivateRack: vi.fn(),
    onDeactivateSlot: vi.fn(),
    onBarcode: vi.fn(),
  }

  render(
    <TooltipProvider>
      <WarehouseLayoutView
        zones={zones}
        selectedZoneId={overrides?.selectedZoneId ?? 'zone-1'}
        selectedRackId={overrides?.selectedRackId ?? 'rack-1'}
        canConfigure
        canGenerateBarcode
        isWarehouseActive
        {...callbacks}
      />
    </TooltipProvider>
  )

  return callbacks
}

describe('WarehouseLayoutView', () => {
  it('renders selected zone, rack, and slot data as an operational explorer', () => {
    renderLayout()

    expect(screen.getByRole('heading', { name: 'Khu vực' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kệ hàng' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vị trí lưu trữ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Khu A/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Kệ A-01/ })).toHaveAttribute('aria-pressed', 'true')
    const occupiedSlot = screen.getByRole('listitem', { name: 'Vị trí A-01-01' })

    expect(within(occupiedSlot).getByText('A-01-01')).toHaveAttribute('translate', 'no')
    expect(within(occupiedSlot).getByText('20 / 100')).toBeInTheDocument()
    expect(within(occupiedSlot).getByText('Đang chứa hàng')).toBeInTheDocument()
    expect(occupiedSlot).toHaveClass('grid')
    expect(occupiedSlot).not.toHaveClass('flex')
    expect(occupiedSlot).not.toHaveClass('flex-col')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('localizes all supported slot availability statuses', () => {
    renderLayout()

    expect(screen.getByText('Còn trống')).toBeInTheDocument()
    expect(screen.getByText('Đã giữ chỗ')).toBeInTheDocument()
    expect(screen.getByText('Đầy')).toBeInTheDocument()
    expect(
      within(screen.getByRole('listitem', { name: 'Vị trí A-01-05' })).getByText('Ngừng hoạt động')
    ).toBeInTheDocument()
  })

  it('keeps long location and barcode values inside their own item', () => {
    renderLayout()

    const slot = screen.getByRole('listitem', { name: 'Vị trí A-01-04-LONG-LOCATION-CODE' })
    expect(within(slot).getByText('A-01-04-LONG-LOCATION-CODE')).toHaveClass('truncate')
    expect(within(slot).getByText('BARCODE-A-01-04')).toHaveClass('truncate')
    expect(within(slot).getByText('100 / 100')).toBeInTheDocument()
  })

  it('reports zone and rack selection through explicit callbacks', async () => {
    const user = userEvent.setup()
    const callbacks = renderLayout()

    await user.click(screen.getByRole('button', { name: /Khu B/ }))
    await user.click(screen.getByRole('button', { name: /Kệ A-02/ }))

    expect(callbacks.onSelectZone).toHaveBeenCalledWith('zone-2')
    expect(callbacks.onSelectRack).toHaveBeenCalledWith('rack-2')
  })

  it('provides mobile drill-down back actions', async () => {
    const user = userEvent.setup()
    const callbacks = renderLayout()

    await user.click(screen.getByRole('button', { name: 'Quay lại danh sách khu vực' }))
    await user.click(screen.getByRole('button', { name: 'Quay lại danh sách kệ' }))

    expect(callbacks.onBackToZones).toHaveBeenCalledOnce()
    expect(callbacks.onBackToRacks).toHaveBeenCalledOnce()
  })

  it('shows a clear empty state when the warehouse has no layout', () => {
    render(
      <TooltipProvider>
        <WarehouseLayoutView
          zones={[]}
          selectedZoneId={null}
          selectedRackId={null}
          onSelectZone={vi.fn()}
          onSelectRack={vi.fn()}
          onBackToZones={vi.fn()}
          onBackToRacks={vi.fn()}
          canConfigure
          canGenerateBarcode
          isWarehouseActive
          onCreateZone={vi.fn()}
          onCreateRack={vi.fn()}
          onCreateSlot={vi.fn()}
          onEditZone={vi.fn()}
          onEditRack={vi.fn()}
          onEditSlot={vi.fn()}
          onDeactivateZone={vi.fn()}
          onDeactivateRack={vi.fn()}
          onDeactivateSlot={vi.fn()}
          onBarcode={vi.fn()}
        />
      </TooltipProvider>
    )

    expect(screen.getByText('Chưa có bố cục kho')).toBeInTheDocument()
  })
})
