import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import type {
  WarehouseLayoutEditorScene,
  WarehouseLayoutSceneResponse,
} from '../types/warehouse-layout-scene.types'
import { WarehouseDesignerPage } from './WarehouseDesignerPage'

interface WorkspaceMockProps {
  readonly initialScene: WarehouseLayoutEditorScene
  readonly canConfigure: boolean
  readonly saveError: string | null
  readonly hasConflict: boolean
  readonly sceneVersion: number
  readonly onSave: (scene: WarehouseLayoutEditorScene, baseVersion: number) => void
  readonly onReload: () => void
  readonly onUpdateRackName: (
    rack: WarehouseLayoutEditorScene['racks'][number],
    rackName: string
  ) => Promise<void>
  readonly onDeactivateRack: (rack: WarehouseLayoutEditorScene['racks'][number]) => Promise<void>
}

const hooks = vi.hoisted(() => ({
  warehouseQuery: {
    data: undefined as { status: string } | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  sceneQuery: {
    data: undefined as WarehouseLayoutSceneResponse | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  meQuery: {
    data: { permissions: ['warehouses:configure-layout'] },
    isLoading: false,
    isError: false,
  },
  saveMutation: { isPending: false, mutateAsync: vi.fn() },
  createZoneMutation: { isPending: false, mutateAsync: vi.fn() },
  createRackMutation: { isPending: false, mutateAsync: vi.fn() },
  updateRackMutation: { isPending: false, mutateAsync: vi.fn() },
  deactivateRackMutation: { isPending: false, mutateAsync: vi.fn() },
}))

vi.mock('../hooks/use-warehouse-layout-scene', () => ({
  useWarehouseLayoutSceneQuery: () => hooks.sceneQuery,
  useSaveWarehouseLayoutSceneMutation: () => hooks.saveMutation,
}))

vi.mock('../hooks/use-warehouse', () => ({
  useWarehouseQuery: () => hooks.warehouseQuery,
  useCreateZoneMutation: () => hooks.createZoneMutation,
  useCreateRackMutation: () => hooks.createRackMutation,
  useUpdateRackMutation: () => hooks.updateRackMutation,
  useDeactivateRackMutation: () => hooks.deactivateRackMutation,
}))

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useMeQuery: () => hooks.meQuery,
}))

vi.mock('../components/WarehouseDetailPage', () => ({
  RackFormSheet: () => null,
  ZoneFormSheet: () => null,
}))

vi.mock('../components/WarehouseDesigner', () => ({
  WarehouseDesignerWorkspace: ({
    initialScene,
    canConfigure,
    saveError,
    hasConflict,
    sceneVersion,
    onSave,
    onReload,
    onUpdateRackName,
    onDeactivateRack,
  }: WorkspaceMockProps) => (
    <div>
      <p>{canConfigure ? 'Có quyền sửa' : 'Chỉ xem'}</p>
      <button type="button" onClick={() => onSave(initialScene, sceneVersion)}>
        Lưu bản nháp
      </button>
      {saveError ? <p>{saveError}</p> : null}
      {hasConflict ? (
        <button type="button" onClick={onReload}>
          Tải bản mới
        </button>
      ) : null}
      {initialScene.racks[0] ? (
        <>
          <button
            type="button"
            onClick={() => void onUpdateRackName(initialScene.racks[0]!, 'Finished goods rack')}
          >
            Đổi tên kệ
          </button>
          <button type="button" onClick={() => void onDeactivateRack(initialScene.racks[0]!)}>
            Ngừng kệ
          </button>
        </>
      ) : null}
    </div>
  ),
}))

const scene: WarehouseLayoutSceneResponse = {
  warehouseId: 'warehouse-1',
  version: 4,
  canvas: { width: 1000, height: 600, gridSize: 20 },
  zones: [],
  racks: [],
  slots: [],
  decorations: [],
}

describe('WarehouseDesignerPage', () => {
  beforeEach(() => {
    hooks.warehouseQuery.data = { status: 'Active' }
    hooks.warehouseQuery.isLoading = false
    hooks.warehouseQuery.isError = false
    hooks.sceneQuery.data = scene
    hooks.sceneQuery.isLoading = false
    hooks.sceneQuery.isError = false
    hooks.sceneQuery.refetch.mockReset().mockResolvedValue({ data: scene })
    hooks.meQuery.data = { permissions: ['warehouses:configure-layout'] }
    hooks.meQuery.isLoading = false
    hooks.meQuery.isError = false
    hooks.saveMutation.mutateAsync.mockReset()
    hooks.updateRackMutation.mutateAsync.mockReset()
    hooks.deactivateRackMutation.mutateAsync.mockReset()
    useAuthStore.setState({
      user: {
        id: 'owner-1',
        tenantId: 'tenant-1',
        fullName: 'Tenant Owner',
        email: 'tenant.owner@sswms.local',
        role: USER_ROLES.TenantOwner,
        isActive: true,
      },
    })
  })

  it('maps the scene and submits the current version as one batch', async () => {
    const user = userEvent.setup()
    hooks.saveMutation.mutateAsync.mockResolvedValue({ data: null })
    render(<WarehouseDesignerPage warehouseId="warehouse-1" />)

    expect(screen.getByText('Có quyền sửa')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Lưu bản nháp' }))

    expect(hooks.saveMutation.mutateAsync).toHaveBeenCalledWith({
      warehouseId: 'warehouse-1',
      request: expect.objectContaining({ warehouseId: 'warehouse-1', version: 4 }),
    })
  })

  it('exposes a reload path after a stale-version conflict', async () => {
    const user = userEvent.setup()
    hooks.saveMutation.mutateAsync.mockRejectedValue({ statusCode: 409, message: 'Conflict' })
    render(<WarehouseDesignerPage warehouseId="warehouse-1" />)

    await user.click(screen.getByRole('button', { name: 'Lưu bản nháp' }))
    expect(await screen.findByText(/Phiên bản trên máy chủ mới hơn/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tải bản mới' }))
    expect(hooks.sceneQuery.refetch).toHaveBeenCalledOnce()
  })

  it('keeps inactive warehouses in view-only mode', () => {
    hooks.warehouseQuery.data = { status: 'Inactive' }
    render(<WarehouseDesignerPage warehouseId="warehouse-1" />)
    expect(screen.getByText('Chỉ xem')).toBeInTheDocument()
  })

  it('uses the assigned permission instead of assuming a role can edit', () => {
    hooks.meQuery.data = { permissions: [] }
    render(<WarehouseDesignerPage warehouseId="warehouse-1" />)
    expect(screen.getByText('Chỉ xem')).toBeInTheDocument()
  })

  it('connects Rack rename and deactivation to their existing API mutations', async () => {
    const user = userEvent.setup()
    hooks.sceneQuery.data = {
      ...scene,
      zones: [
        {
          id: 'zone-1',
          zoneCode: 'A',
          zoneName: 'Zone A',
          status: 'Active',
          x: 20,
          y: 20,
          width: 500,
          height: 300,
          rotation: 0,
          zIndex: 0,
        },
      ],
      racks: [
        {
          id: 'rack-1',
          zoneId: 'zone-1',
          zoneCode: 'A',
          rackCode: 'R-01',
          rackName: 'Rack 01',
          status: 'Active',
          x: 60,
          y: 80,
          width: 240,
          height: 120,
          rotation: 0,
          zIndex: 1,
        },
      ],
    }
    hooks.updateRackMutation.mutateAsync.mockResolvedValue({ data: null })
    hooks.deactivateRackMutation.mutateAsync.mockResolvedValue({ data: null })
    render(<WarehouseDesignerPage warehouseId="warehouse-1" />)

    await user.click(screen.getByRole('button', { name: 'Đổi tên kệ' }))
    expect(hooks.updateRackMutation.mutateAsync).toHaveBeenCalledWith({
      warehouseId: 'warehouse-1',
      zoneId: 'zone-1',
      rackId: 'rack-1',
      request: { rackCode: 'R-01', rackName: 'Finished goods rack' },
    })

    await user.click(screen.getByRole('button', { name: 'Ngừng kệ' }))
    expect(hooks.deactivateRackMutation.mutateAsync).toHaveBeenCalledWith({
      warehouseId: 'warehouse-1',
      zoneId: 'zone-1',
      rackId: 'rack-1',
    })
  })

  it('renders an explicit scene error state', () => {
    hooks.sceneQuery.data = undefined
    hooks.sceneQuery.isError = true
    render(<WarehouseDesignerPage warehouseId="warehouse-1" />)
    expect(screen.getByText('Không thể tải trình thiết kế')).toBeInTheDocument()
  })
})
