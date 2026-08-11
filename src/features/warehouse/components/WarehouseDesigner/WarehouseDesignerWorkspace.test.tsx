import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { WarehouseLayoutEditorScene } from '../../types/warehouse-layout-scene.types'
import { WarehouseDesignerWorkspace } from './WarehouseDesignerWorkspace'

const responsiveState = vi.hoisted(() => ({ isCompact: false }))

vi.mock('next/dynamic', () => ({
  default: () =>
    function WarehouseCanvasMock({
      onSelect,
      tool,
    }: {
      readonly onSelect: (selection: { kind: 'zone'; id: string }) => void
      readonly tool: 'select' | 'pan'
    }) {
      return (
        <div data-testid="canvas-tool" data-tool={tool}>
          <button type="button" onClick={() => onSelect({ kind: 'zone', id: 'zone-1' })}>
            Chọn khu vực trên canvas
          </button>
        </div>
      )
    },
}))

vi.mock('../../hooks/use-layout-designer-compact', () => ({
  useLayoutDesignerCompact: () => responsiveState.isCompact,
}))

const scene: WarehouseLayoutEditorScene = {
  canvas: { width: 1200, height: 800, gridSize: 20 },
  zones: [
    {
      id: 'zone-1',
      zoneCode: 'A',
      zoneName: 'Khu A',
      status: 'Active',
      x: 40,
      y: 40,
      width: 520,
      height: 320,
      rotation: 0,
      zIndex: 0,
    },
  ],
  racks: [],
  slots: [],
  decorations: [],
}

const callbacks = {
  onCreateZone: vi.fn(),
  onCreateRack: vi.fn(),
  onSave: vi.fn(),
  onReload: vi.fn(),
  onUpdateRackName: vi.fn(),
  onDeactivateRack: vi.fn(),
}

function renderWorkspace(
  overrides: Partial<React.ComponentProps<typeof WarehouseDesignerWorkspace>> = {}
) {
  return render(
    <TooltipProvider>
      <WarehouseDesignerWorkspace
        warehouseId="warehouse-1"
        sceneVersion={4}
        resetRevision={0}
        initialScene={scene}
        hasGeneratedGeometry={false}
        canConfigure
        isSaving={false}
        isUpdatingRack={false}
        isDeactivatingRack={false}
        saveError={null}
        hasConflict={false}
        {...callbacks}
        {...overrides}
      />
    </TooltipProvider>
  )
}

describe('WarehouseDesignerWorkspace', () => {
  beforeEach(() => {
    responsiveState.isCompact = false
    Object.values(callbacks).forEach((callback) => callback.mockReset())
    callbacks.onUpdateRackName.mockResolvedValue(undefined)
    callbacks.onDeactivateRack.mockResolvedValue(undefined)
  })

  it('keeps Properties closed until an object is selected', async () => {
    const user = userEvent.setup()
    renderWorkspace()

    expect(screen.queryByText('Hình học')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Chọn khu vực trên canvas' }))

    expect(screen.getByText('Hình học')).toBeInTheDocument()
    expect(screen.getAllByText('Khu A')).toHaveLength(2)
    expect(screen.getByLabelText('X')).toBeEnabled()
  })

  it('closes Properties without clearing selection and opens it again on selection', async () => {
    const user = userEvent.setup()
    renderWorkspace()

    await user.click(screen.getByRole('button', { name: 'Chọn khu vực trên canvas' }))
    await user.click(screen.getByRole('button', { name: 'Đóng bảng thuộc tính' }))

    expect(screen.queryByText('Hình học')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^AKhu A/ })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Chọn khu vực trên canvas' }))
    expect(screen.getByText('Hình học')).toBeInTheDocument()
  })

  it('clears selection and closes Properties with Escape', async () => {
    const user = userEvent.setup()
    renderWorkspace()

    await user.click(screen.getByRole('button', { name: 'Chọn khu vực trên canvas' }))
    fireEvent.keyDown(screen.getByRole('region', { name: 'Trình thiết kế bố cục kho' }), {
      key: 'Escape',
    })

    expect(screen.queryByText('Hình học')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^AKhu A/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('temporarily switches to pan while Control is held', () => {
    renderWorkspace()

    expect(screen.getByTestId('canvas-tool')).toHaveAttribute('data-tool', 'select')
    fireEvent.keyDown(window, { key: 'Control', ctrlKey: true })
    expect(screen.getByTestId('canvas-tool')).toHaveAttribute('data-tool', 'pan')

    fireEvent.keyUp(window, { key: 'Control' })
    expect(screen.getByTestId('canvas-tool')).toHaveAttribute('data-tool', 'select')
  })

  it('creates a local decoration, enables save, and only exposes delete for that decoration', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const saveButton = screen.getByRole('button', { name: 'Lưu sơ đồ' })

    expect(saveButton).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Khu nhận hàng' }))

    expect(saveButton).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Xóa' }))
    expect(screen.queryByRole('button', { name: 'Xóa' })).not.toBeInTheDocument()
  })

  it('changes the selected object color and includes it when saving', async () => {
    const user = userEvent.setup()
    renderWorkspace()

    await user.click(screen.getByRole('button', { name: /^AKhu A/ }))
    await user.click(screen.getByRole('button', { name: 'Chọn màu #B9DDF2' }))
    await user.click(screen.getByRole('button', { name: /L.u s. ./ }))

    expect(callbacks.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        zones: expect.arrayContaining([
          expect.objectContaining({ id: 'zone-1', color: '#B9DDF2' }),
        ]),
      }),
      4
    )
  })

  it('updates the selected Rack name while preserving its code', async () => {
    const user = userEvent.setup()
    const rack = {
      id: 'rack-1',
      zoneId: 'zone-1',
      zoneCode: 'A',
      rackCode: 'R-01',
      rackName: 'Kệ cũ',
      status: 'Active',
      x: 80,
      y: 100,
      width: 240,
      height: 120,
      rotation: 0,
      zIndex: 1,
    }
    renderWorkspace({ initialScene: { ...scene, racks: [rack] } })

    await user.click(screen.getByRole('button', { name: 'Mở khu vực A' }))
    await user.click(screen.getByRole('button', { name: /^R-01/ }))
    const nameInput = screen.getByLabelText('Tên kệ')
    fireEvent.change(nameInput, { target: { value: 'Finished goods rack' } })
    expect(nameInput).toHaveValue('Finished goods rack')
    const saveNameButton = screen.getByRole('button', { name: 'Lưu tên kệ' })
    expect(saveNameButton).toBeEnabled()
    await user.click(saveNameButton)

    await waitFor(() =>
      expect(callbacks.onUpdateRackName).toHaveBeenCalledWith(rack, 'Finished goods rack')
    )
  })

  it('requires confirmation before deactivating a Rack from button or keyboard', async () => {
    const user = userEvent.setup()
    const rack = {
      id: 'rack-1',
      zoneId: 'zone-1',
      zoneCode: 'A',
      rackCode: 'R-01',
      rackName: 'Kệ 01',
      status: 'Active',
      x: 80,
      y: 100,
      width: 240,
      height: 120,
      rotation: 0,
      zIndex: 1,
    }
    renderWorkspace({ initialScene: { ...scene, racks: [rack] } })

    await user.click(screen.getByRole('button', { name: 'Mở khu vực A' }))
    await user.click(screen.getByRole('button', { name: /^R-01/ }))
    fireEvent.keyDown(screen.getByRole('region', { name: 'Trình thiết kế bố cục kho' }), {
      key: 'Delete',
    })
    expect(callbacks.onDeactivateRack).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Xác nhận ngừng' }))
    expect(callbacks.onDeactivateRack).toHaveBeenCalledWith(rack)
    expect(screen.queryByLabelText('Tên kệ')).not.toBeInTheDocument()
  })

  it('keeps the Rack selected and reports a backend deactivation error', async () => {
    const user = userEvent.setup()
    const rack = {
      id: 'rack-1',
      zoneId: 'zone-1',
      zoneCode: 'A',
      rackCode: 'R-01',
      rackName: 'Rack 01',
      status: 'Active',
      x: 80,
      y: 100,
      width: 240,
      height: 120,
      rotation: 0,
      zIndex: 1,
    }
    callbacks.onDeactivateRack.mockRejectedValueOnce(
      new Error('Rack still contains inventory or reservations.')
    )
    renderWorkspace({ initialScene: { ...scene, racks: [rack] } })

    await user.click(screen.getByRole('button', { name: 'Mở khu vực A' }))
    await user.click(screen.getByRole('button', { name: /^R-01/ }))
    await user.click(screen.getByRole('button', { name: 'Ngừng hoạt động kệ' }))
    await user.click(screen.getByRole('button', { name: 'Xác nhận ngừng' }))

    expect(
      await screen.findByText('Rack still contains inventory or reservations.')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Tên kệ')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(screen.getByRole('button', { name: /^R-01/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('disables editing controls in view-only mode', () => {
    renderWorkspace({ canConfigure: false, hasGeneratedGeometry: true })

    expect(screen.getByText('Chế độ xem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Khu vực' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Khu nhận hàng' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Lưu sơ đồ' })).toBeDisabled()
    expect(screen.queryByText('Chưa lưu')).not.toBeInTheDocument()
  })

  it('keeps inactive business objects inspectable but not editable', async () => {
    const user = userEvent.setup()
    renderWorkspace({
      initialScene: {
        ...scene,
        zones: scene.zones.map((zone) => ({ ...zone, status: 'Inactive' })),
      },
    })

    await user.click(screen.getByRole('button', { name: 'Chọn khu vực trên canvas' }))
    expect(screen.getByLabelText('X')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Kệ hàng' })).toBeDisabled()
  })

  it('keeps an inactive Rack in the object list without edit or deactivate actions', async () => {
    const user = userEvent.setup()
    renderWorkspace({
      initialScene: {
        ...scene,
        racks: [
          {
            id: 'rack-1',
            zoneId: 'zone-1',
            zoneCode: 'A',
            rackCode: 'R-01',
            rackName: 'Rack 01',
            status: 'Inactive',
            x: 80,
            y: 100,
            width: 240,
            height: 120,
            rotation: 0,
            zIndex: 1,
          },
        ],
      },
    })

    await user.click(screen.getByRole('button', { name: 'Mở khu vực A' }))
    await user.click(screen.getByRole('button', { name: /^R-01/ }))
    expect(screen.getByText('Ngừng hoạt động')).toBeInTheDocument()
    expect(screen.getByText('Rack 01')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu tên kệ' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ngừng hoạt động kệ' })).not.toBeInTheDocument()
  })

  it('keeps the scene outline inside its own bounded scroll area', () => {
    const racks = Array.from({ length: 120 }, (_, index) => ({
      id: `rack-${index + 1}`,
      zoneId: 'zone-1',
      zoneCode: 'A',
      rackCode: `R-${index + 1}`,
      rackName: `Rack ${index + 1}`,
      status: 'Active',
      x: 80,
      y: 100 + index * 20,
      width: 240,
      height: 120,
      rotation: 0,
      zIndex: index + 1,
    }))
    renderWorkspace({ initialScene: { ...scene, racks } })

    const outline = screen.getByRole('region', { name: 'Danh sách sơ đồ' })
    const outlineScrollArea = outline.querySelector('[data-slot="scroll-area"]')

    expect(outline).toHaveClass('min-h-0', 'flex-1', 'overflow-hidden')
    expect(outlineScrollArea).toHaveClass('min-h-0', 'flex-1')
    expect(outlineScrollArea).not.toContainElement(
      screen.getByRole('heading', { name: 'Danh sách sơ đồ' })
    )
    expect(outline).toHaveTextContent('121')
    expect(screen.queryByText('R-120')).not.toBeInTheDocument()
  })

  it('shows an explicit reload action for a version conflict', async () => {
    const user = userEvent.setup()
    renderWorkspace({
      saveError: 'Phiên bản trên máy chủ mới hơn.',
      hasConflict: true,
    })

    expect(screen.getByText('Sơ đồ đã được thay đổi ở nơi khác')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tải bản mới' }))
    expect(callbacks.onReload).toHaveBeenCalledOnce()
  })

  it('keeps the selected Zone context when switching from Properties to the mobile toolbox', async () => {
    const user = userEvent.setup()
    responsiveState.isCompact = true
    renderWorkspace()

    await user.click(screen.getByRole('button', { name: 'Chọn khu vực trên canvas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Đóng bảng thuộc tính' }))
    fireEvent.click(screen.getByRole('button', { name: 'Đối tượng', hidden: true }))

    expect(screen.getByRole('button', { name: 'Kệ hàng' })).toBeEnabled()
  })

  it('keeps the local draft when the server adds a business object without changing version', async () => {
    const user = userEvent.setup()
    const view = renderWorkspace()
    await user.click(screen.getByRole('button', { name: 'Khu nhận hàng' }))

    const sceneWithNewZone: WarehouseLayoutEditorScene = {
      ...scene,
      zones: [
        ...scene.zones,
        {
          ...scene.zones[0],
          id: 'zone-2',
          zoneCode: 'B',
          zoneName: 'Khu B',
          x: 600,
        },
      ],
    }
    view.rerender(
      <TooltipProvider>
        <WarehouseDesignerWorkspace
          warehouseId="warehouse-1"
          sceneVersion={4}
          resetRevision={0}
          initialScene={sceneWithNewZone}
          hasGeneratedGeometry
          canConfigure
          isSaving={false}
          isUpdatingRack={false}
          isDeactivatingRack={false}
          saveError={null}
          hasConflict={false}
          {...callbacks}
        />
      </TooltipProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Lưu sơ đồ' }))
    expect(callbacks.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        zones: expect.arrayContaining([expect.objectContaining({ id: 'zone-2' })]),
        decorations: expect.arrayContaining([expect.objectContaining({ type: 'Receiving' })]),
      }),
      4
    )
  })
})
