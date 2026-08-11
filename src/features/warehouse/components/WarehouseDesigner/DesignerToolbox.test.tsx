import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type {
  WarehouseLayoutEditorScene,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import { DesignerToolbox } from './DesignerToolbox'

const scene: WarehouseLayoutEditorScene = {
  canvas: { width: 1200, height: 800, gridSize: 20 },
  zones: [
    {
      id: 'zone-a',
      zoneCode: 'A',
      zoneName: 'Khu A',
      status: 'Active',
      x: 20,
      y: 20,
      width: 500,
      height: 300,
      rotation: 0,
      zIndex: 0,
    },
    {
      id: 'zone-b',
      zoneCode: 'B',
      zoneName: 'Khu B',
      status: 'Active',
      x: 560,
      y: 20,
      width: 500,
      height: 300,
      rotation: 0,
      zIndex: 1,
    },
  ],
  racks: [
    {
      id: 'rack-a',
      zoneId: 'zone-a',
      zoneCode: 'A',
      rackCode: 'R-01',
      rackName: 'Rack 01',
      status: 'Active',
      x: 60,
      y: 80,
      width: 240,
      height: 100,
      rotation: 0,
      zIndex: 2,
    },
    {
      id: 'rack-b',
      zoneId: 'zone-b',
      zoneCode: 'B',
      rackCode: 'R-02',
      rackName: 'Rack 02',
      status: 'Inactive',
      x: 600,
      y: 80,
      width: 240,
      height: 100,
      rotation: 0,
      zIndex: 3,
    },
    {
      id: 'rack-orphan',
      zoneId: 'missing-zone',
      zoneCode: 'X',
      rackCode: 'R-X',
      rackName: 'Orphan rack',
      status: 'Active',
      x: 60,
      y: 380,
      width: 240,
      height: 100,
      rotation: 0,
      zIndex: 4,
    },
  ],
  slots: [
    {
      id: 'slot-a',
      zoneId: 'zone-a',
      rackId: 'rack-a',
      slotCode: 'S-01',
      occupancyStatus: 'Vacant',
      isActive: true,
      capacity: 10,
      currentOccupancy: 0,
    },
    {
      id: 'slot-orphan-rack',
      zoneId: 'missing-zone',
      rackId: 'rack-orphan',
      slotCode: 'S-X1',
      occupancyStatus: 'Vacant',
      isActive: true,
      capacity: 10,
      currentOccupancy: 0,
    },
    {
      id: 'slot-orphan',
      zoneId: 'missing-zone',
      rackId: 'missing-rack',
      slotCode: 'S-X2',
      occupancyStatus: 'Vacant',
      isActive: true,
      capacity: 10,
      currentOccupancy: 0,
    },
  ],
  decorations: [
    {
      id: 'decoration-1',
      clientKey: 'decoration-1',
      type: 'Door',
      label: 'Cửa chính',
      x: 20,
      y: 360,
      width: 120,
      height: 80,
      rotation: 0,
      zIndex: 500,
    },
  ],
}

function renderToolbox(selection: WarehouseLayoutSelection | null = null) {
  const onSelect = vi.fn()
  const result = render(
    <TooltipProvider>
      <div className="h-[36rem]">
        <DesignerToolbox
          scene={scene}
          selection={selection}
          canConfigure
          onCreateZone={vi.fn()}
          onCreateRack={vi.fn()}
          onCreateDecoration={vi.fn()}
          onSelect={onSelect}
        />
      </div>
    </TooltipProvider>
  )
  return { ...result, onSelect }
}

describe('DesignerToolbox scene outline', () => {
  it('renders Zone, Rack, and Slot as a collapsed three-level hierarchy', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderToolbox()

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByText('R-01')).not.toBeInTheDocument()
    expect(screen.queryByText('S-01')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mở khu vực A' }))
    expect(screen.getByText('R-01')).toBeInTheDocument()
    expect(screen.queryByText('S-01')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mở kệ hàng R-01' }))
    expect(screen.getByText('S-01')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^R-01Rack 01/ }))
    expect(onSelect).toHaveBeenCalledWith({ kind: 'rack', id: 'rack-a' })
  })

  it('automatically opens every ancestor of the selected Slot', () => {
    renderToolbox({ kind: 'slot', id: 'slot-a' })

    expect(screen.getByRole('button', { name: 'Thu gọn khu vực A' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Thu gọn kệ hàng R-01' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('button', { name: /^S-01/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('preserves multiple expanded groups and collapses all manual branches', async () => {
    const user = userEvent.setup()
    renderToolbox()

    await user.click(screen.getByRole('button', { name: 'Mở khu vực A' }))
    await user.click(screen.getByRole('button', { name: 'Mở khu vực B' }))
    await user.click(screen.getByRole('button', { name: 'Mở khu chức năng' }))
    expect(screen.getByText('R-01')).toBeInTheDocument()
    expect(screen.getByText('R-02')).toBeInTheDocument()
    expect(screen.getByText('Cửa chính')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Thu gọn tất cả' }))
    expect(screen.queryByText('R-01')).not.toBeInTheDocument()
    expect(screen.queryByText('R-02')).not.toBeInTheDocument()
    expect(screen.queryByText('Cửa chính')).not.toBeInTheDocument()
  })

  it('keeps inactive and orphan objects discoverable in their proper groups', async () => {
    const user = userEvent.setup()
    renderToolbox()

    await user.click(screen.getByRole('button', { name: 'Mở khu vực B' }))
    expect(screen.getByText('R-02')).toBeInTheDocument()
    expect(screen.getByText('Ngừng hoạt động')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mở chưa phân loại' }))
    expect(screen.getByText('R-X')).toBeInTheDocument()
    expect(screen.getByText('S-X2')).toBeInTheDocument()
    expect(screen.queryByText('S-X1')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mở kệ hàng R-X' }))
    expect(screen.getByText('S-X1')).toBeInTheDocument()
  })
})
