import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type {
  WarehouseLayoutEditorScene,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import { WarehouseLayoutViewerWorkspace } from './WarehouseLayoutViewerWorkspace'
import { TooltipProvider } from '@/components/ui/tooltip'

vi.mock('next/dynamic', () => ({
  default: () =>
    function Canvas({ onSelect }: { onSelect: (value: WarehouseLayoutSelection) => void }) {
      return <button onClick={() => onSelect({ kind: 'rack', id: 'rack' })}>Chọn kệ canvas</button>
    },
}))
vi.mock('../../hooks/use-layout-designer-compact', () => ({
  useLayoutDesignerCompact: () => false,
}))
vi.mock('@/features/inventory/hooks/use-inventory', () => ({
  useInventoryQuery: () => ({
    data: { items: [], totalCount: 0 },
    isPending: false,
    isError: false,
  }),
}))
vi.mock('@/components/ui/resizable', () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResizablePanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResizableHandle: () => null,
}))

const scene: WarehouseLayoutEditorScene = {
  canvas: { width: 800, height: 600, gridSize: 10 },
  zones: [],
  slots: [],
  decorations: [],
  racks: [
    {
      id: 'rack',
      zoneId: 'zone',
      zoneCode: 'ZA',
      rackCode: 'R01',
      rackName: 'Kệ 1',
      description: null,
      status: 'Active',
      storageMode: 'RackLevel',
      x: 30,
      y: 30,
      width: 160,
      height: 60,
      rotation: 0,
      zIndex: 1,
      capacityType: 'Quantity',
      capacity: 20,
      capacityUnitName: 'Thùng',
      capacityUsed: 8,
      currentOccupancy: 192,
      remainingCapacity: 12,
      utilizationPercent: 40,
    },
  ],
}

describe('viewer capacity summary', () => {
  it('shows normalized usage and capacity unit for the selected rack', () => {
    render(
      <TooltipProvider>
        <WarehouseLayoutViewerWorkspace
          warehouseId="warehouse"
          warehouseName="Kho"
          scene={scene}
          canConfigure={false}
          isClosing={false}
          onClose={vi.fn()}
        />
      </TooltipProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Chọn kệ canvas' }))
    expect(screen.getByText('8 / 20')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Mức sử dụng sức chứa' })).toHaveAttribute(
      'aria-valuenow',
      '8'
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '8 / 20 Thùng · Còn chỗ'
    )
  })
  it('shows a pending warning and edit action only for permitted viewers', () => {
    const onEdit = vi.fn()
    const pending = {
      ...scene,
      racks: scene.racks.map((rack) => ({
        ...rack,
        capacityType: 'None' as const,
        requiresCapacityConfiguration: true,
      })),
    }
    const result = render(
      <TooltipProvider>
        <WarehouseLayoutViewerWorkspace
          warehouseId="warehouse"
          warehouseName="Kho"
          scene={pending}
          canConfigure
          isClosing={false}
          onClose={vi.fn()}
          onEdit={onEdit}
        />
      </TooltipProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Chọn kệ canvas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cấu hình sức chứa' }))
    expect(onEdit).toHaveBeenCalledOnce()
    result.rerender(
      <TooltipProvider>
        <WarehouseLayoutViewerWorkspace
          warehouseId="warehouse"
          warehouseName="Kho"
          scene={pending}
          canConfigure={false}
          isClosing={false}
          onClose={vi.fn()}
          onEdit={onEdit}
        />
      </TooltipProvider>
    )
    expect(screen.queryByRole('button', { name: 'Cấu hình sức chứa' })).not.toBeInTheDocument()
  })
})
