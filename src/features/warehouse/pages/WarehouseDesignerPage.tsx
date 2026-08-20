'use client'

import { RefreshCw, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/stores/auth.store'
import { RackFormSheet, ZoneFormSheet } from '../components/WarehouseDetailPage'
import { WarehouseDesignerWorkspace } from '../components/WarehouseDesigner'
import {
  useSaveWarehouseLayoutSceneMutation,
  useWarehouseLayoutSceneQuery,
} from '../hooks/use-warehouse-layout-scene'
import {
  useCreateRackMutation,
  useCreateZoneMutation,
  useDeactivateRackMutation,
  useUpdateRackMutation,
  useWarehouseQuery,
} from '../hooks/use-warehouse'
import type { RackFormValues, ZoneFormValues } from '../schemas/warehouse.schema'
import type {
  WarehouseLayoutEditorRack,
  WarehouseLayoutEditorScene,
} from '../types/warehouse-layout-scene.types'
import { getWarehouseCapabilities } from '../utils/warehouse-capabilities'
import { mapEditorSceneToSaveRequest, mapWarehouseLayoutScene } from '../utils/layout-scene-mapper'

interface WarehouseDesignerPageProps {
  readonly warehouseId: string
}

export function WarehouseDesignerPage({ warehouseId }: WarehouseDesignerPageProps) {
  const role = useAuthStore((state) => state.user?.role ?? null)
  const capabilities = getWarehouseCapabilities(role)
  const meQuery = useMeQuery()
  const warehouseQuery = useWarehouseQuery(warehouseId)
  const sceneQuery = useWarehouseLayoutSceneQuery(warehouseId)
  const saveMutation = useSaveWarehouseLayoutSceneMutation()
  const createZoneMutation = useCreateZoneMutation()
  const createRackMutation = useCreateRackMutation()
  const updateRackMutation = useUpdateRackMutation()
  const deactivateRackMutation = useDeactivateRackMutation()
  const [isZoneFormOpen, setIsZoneFormOpen] = useState(false)
  const [rackZoneId, setRackZoneId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [hasConflict, setHasConflict] = useState(false)
  const [resetRevision, setResetRevision] = useState(0)
  const mappedScene = useMemo(
    () => (sceneQuery.data ? mapWarehouseLayoutScene(sceneQuery.data) : null),
    [sceneQuery.data]
  )

  if (warehouseQuery.isLoading || sceneQuery.isLoading || meQuery.isLoading) {
    return <Skeleton className="h-[min(72dvh,48rem)] min-h-[32rem] w-full" />
  }

  if (
    warehouseQuery.isError ||
    sceneQuery.isError ||
    meQuery.isError ||
    !warehouseQuery.data ||
    !sceneQuery.data ||
    !mappedScene ||
    !meQuery.data
  ) {
    return (
      <Empty className="min-h-80 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert className="text-destructive" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Không thể tải trình thiết kế</EmptyTitle>
          <EmptyDescription>
            Dữ liệu scene chưa sẵn sàng hoặc bạn không còn quyền truy cập kho này.
          </EmptyDescription>
        </EmptyHeader>
        <Button
          type="button"
          onClick={() => void Promise.all([warehouseQuery.refetch(), sceneQuery.refetch()])}
        >
          <RefreshCw data-icon="inline-start" aria-hidden="true" />
          Thử lại
        </Button>
      </Empty>
    )
  }

  const persistedScene = sceneQuery.data
  const { editorScene, hasGeneratedGeometry } = mappedScene
  const canConfigure =
    capabilities.canConfigureLayout &&
    meQuery.data.permissions.includes('warehouses:configure-layout') &&
    warehouseQuery.data.status === 'Active'

  async function saveScene(scene: WarehouseLayoutEditorScene, baseVersion: number) {
    setSaveError(null)
    setHasConflict(false)
    try {
      await saveMutation.mutateAsync({
        warehouseId,
        request: mapEditorSceneToSaveRequest(warehouseId, baseVersion, scene),
      })
      setResetRevision((revision) => revision + 1)
      toast.success('Đã lưu bố cục kho.')
    } catch (error) {
      const statusCode =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? error.statusCode
          : null
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Không thể lưu bố cục kho. Vui lòng thử lại.'
      setHasConflict(statusCode === 409)
      setSaveError(
        statusCode === 409
          ? 'Phiên bản trên máy chủ mới hơn bản bạn đang chỉnh sửa. Tải bản mới trước khi tiếp tục.'
          : message
      )
    }
  }

  async function submitZone(values: ZoneFormValues) {
    try {
      await createZoneMutation.mutateAsync({ warehouseId, request: values })
      toast.success('Đã thêm khu vực. Đối tượng mới đã được đặt vào sơ đồ.')
      setIsZoneFormOpen(false)
      return true
    } catch (error) {
      console.error(error)
      toast.error('Không thể thêm khu vực. Vui lòng thử lại.')
      return false
    }
  }

  async function submitRack(values: RackFormValues) {
    if (!rackZoneId) return false
    try {
      await createRackMutation.mutateAsync({ warehouseId, zoneId: rackZoneId, request: values })
      toast.success('Đã thêm kệ hàng. Đối tượng mới đã được đặt vào sơ đồ.')
      setRackZoneId(null)
      return true
    } catch (error) {
      console.error(error)
      toast.error('Không thể thêm kệ hàng. Vui lòng thử lại.')
      return false
    }
  }

  async function reloadScene() {
    setSaveError(null)
    setHasConflict(false)
    const result = await sceneQuery.refetch()
    if (result.data) setResetRevision((revision) => revision + 1)
  }

  async function updateRackName(rack: WarehouseLayoutEditorRack, rackName: string) {
    await updateRackMutation.mutateAsync({
      warehouseId,
      zoneId: rack.zoneId,
      rackId: rack.id,
      request: { rackCode: rack.rackCode, rackName },
    })
  }

  async function deactivateRack(rack: WarehouseLayoutEditorRack) {
    await deactivateRackMutation.mutateAsync({
      warehouseId,
      zoneId: rack.zoneId,
      rackId: rack.id,
    })
  }

  return (
    <>
      <WarehouseDesignerWorkspace
        warehouseId={warehouseId}
        sceneVersion={persistedScene.version}
        resetRevision={resetRevision}
        initialScene={editorScene}
        hasGeneratedGeometry={hasGeneratedGeometry}
        canConfigure={canConfigure}
        isSaving={saveMutation.isPending}
        isUpdatingRack={updateRackMutation.isPending}
        isDeactivatingRack={deactivateRackMutation.isPending}
        saveError={saveError}
        hasConflict={hasConflict}
        onCreateZone={() => setIsZoneFormOpen(true)}
        onCreateRack={setRackZoneId}
        onUpdateRackName={updateRackName}
        onDeactivateRack={deactivateRack}
        onSave={(scene, baseVersion) => void saveScene(scene, baseVersion)}
        onReload={() => void reloadScene()}
      />

      {isZoneFormOpen ? (
        <ZoneFormSheet
          open
          mode="create"
          isPending={createZoneMutation.isPending}
          defaultValues={{ zoneCode: '', zoneName: '', description: '' }}
          onOpenChange={(open) => !open && setIsZoneFormOpen(false)}
          onSubmit={submitZone}
        />
      ) : null}

      {rackZoneId ? (
        <RackFormSheet
          open
          mode="create"
          isPending={createRackMutation.isPending}
          defaultValues={{ rackCode: '', rackName: '' }}
          onOpenChange={(open) => !open && setRackZoneId(null)}
          onSubmit={submitRack}
        />
      ) : null}
    </>
  )
}
