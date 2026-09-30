'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logger } from '@/lib/logger'
import { AlertCircle, Boxes, Info, RefreshCw, X } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useWarehouseLayoutEditorStore } from '@/stores/warehouse-layout-editor.store'
import { useLayoutDesignerCompact } from '../../hooks/use-layout-designer-compact'
import { useLayoutEditorHistory } from '../../hooks/use-layout-editor-history'
import type {
  WarehouseLayoutDecorationType,
  WarehouseLayoutEditorScene,
  WarehouseLayoutEditorRack,
  WarehouseLayoutGeometry,
  WarehouseLayoutGeometryTarget,
  WarehouseLayoutRackShape,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import type { LayoutPaletteDragData } from './designer-constants'
import { constrainLayoutGeometryToCanvas } from '../../utils/layout-grid'
import { WarehouseLocationDeactivateDialog } from '../WarehouseDetailPage'
import { DesignerInspector } from './DesignerInspector'
import { DesignerContextToolbar } from './DesignerContextToolbar'
import { DesignerFooter, DesignerToolbar } from './DesignerToolbar'
import { DesignerToolbox } from './DesignerToolbox'
import type { WarehouseCanvasHandle } from './WarehouseCanvas'

const WarehouseCanvas = dynamic(
  () => import('./WarehouseCanvas').then((module) => module.WarehouseCanvas),
  { ssr: false, loading: () => <Skeleton className="h-full min-h-[28rem] w-full" /> }
)

interface WarehouseDesignerWorkspaceProps {
  readonly warehouseId: string
  readonly warehouseName: string
  readonly sceneVersion: number
  readonly resetRevision: number
  readonly initialScene: WarehouseLayoutEditorScene
  readonly hasGeneratedGeometry: boolean
  readonly canConfigure: boolean
  readonly isSaving: boolean
  readonly isUpdatingRack: boolean
  readonly isDeactivatingRack: boolean
  readonly saveError: string | null
  readonly hasConflict: boolean
  readonly placementToApply: WarehouseLayoutCreatedPlacement | null
  readonly onPlacementApplied: () => void
  readonly onCreateZone: (position?: WarehouseLayoutDropPosition) => void
  readonly onCreateRack: (zoneId: string, position?: WarehouseLayoutDropPosition) => void
  readonly onUpdateRackName: (rack: WarehouseLayoutEditorRack, rackName: string) => Promise<void>
  readonly onDeactivateRack: (rack: WarehouseLayoutEditorRack) => Promise<void>
  readonly onSave: (scene: WarehouseLayoutEditorScene, baseVersion: number) => void
  readonly onReload: () => void
}

export interface WarehouseLayoutDropPosition {
  readonly x: number
  readonly y: number
  readonly width?: number
  readonly height?: number
  readonly layoutShape?: WarehouseLayoutRackShape
}
export interface WarehouseLayoutCreatedPlacement extends WarehouseLayoutDropPosition {
  readonly kind: 'zone' | 'rack'
  readonly entityId: string
}

function createClientKey() {
  return globalThis.crypto?.randomUUID?.() ?? `layout-${Date.now()}-${Math.random()}`
}

function getDuplicateLabel(label: string): string {
  const suffix = ' bản sao'
  return `${label.slice(0, 100 - suffix.length).trimEnd()}${suffix}`
}

function getRackPresetSize(shape: WarehouseLayoutRackShape | undefined, gridSize: number) {
  if (shape === 'Vertical') return { width: gridSize * 5, height: gridSize * 13 }
  if (shape === 'Pallet') return { width: gridSize * 8, height: gridSize * 8 }
  if (shape === 'CrossBraced') return { width: gridSize * 12, height: gridSize * 7 }
  return { width: gridSize * 13, height: gridSize * 5 }
}

function isFormControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement &&
      (target.isContentEditable || Boolean(target.closest('button, a, [role="button"]'))))
  )
}

export function WarehouseDesignerWorkspace({
  warehouseId,
  warehouseName,
  sceneVersion,
  resetRevision,
  initialScene,
  hasGeneratedGeometry,
  canConfigure,
  isSaving,
  isUpdatingRack,
  isDeactivatingRack,
  saveError,
  hasConflict,
  onCreateZone,
  onCreateRack,
  placementToApply,
  onPlacementApplied,
  onUpdateRackName,
  onDeactivateRack,
  onSave,
  onReload,
}: WarehouseDesignerWorkspaceProps) {
  const router = useRouter()
  const [history, dispatch] = useLayoutEditorHistory(initialScene)
  const [selection, setSelection] = useState<WarehouseLayoutSelection | null>(null)
  const [isGridVisible, setIsGridVisible] = useState(true)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [isToolboxOpen, setIsToolboxOpen] = useState(false)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [rackDeactivateTarget, setRackDeactivateTarget] =
    useState<WarehouseLayoutEditorRack | null>(null)
  const [rackDeactivateError, setRackDeactivateError] = useState<string | null>(null)
  const canvasRef = useRef<WarehouseCanvasHandle>(null)
  const initialSceneRef = useRef(initialScene)
  const resetRevisionRef = useRef(resetRevision)
  const baseVersionRef = useRef(sceneVersion)
  const isCompact = useLayoutDesignerCompact()
  const setWarehouseDirty = useWarehouseLayoutEditorStore((state) => state.setWarehouseDirty)
  const scene = history.present
  const isDirty = hasGeneratedGeometry || history.past.length > 0

  useEffect(() => {
    const resetRequested = resetRevisionRef.current !== resetRevision
    const serverSceneChanged = initialSceneRef.current !== initialScene
    if (!resetRequested && !serverSceneChanged) return

    initialSceneRef.current = initialScene
    resetRevisionRef.current = resetRevision
    if (resetRequested || !isDirty) {
      baseVersionRef.current = sceneVersion
      dispatch({ type: 'reset', scene: initialScene })
      setSelection(null)
      setIsInspectorOpen(false)
      return
    }

    dispatch({ type: 'reconcile-server-scene', scene: initialScene })
  }, [dispatch, initialScene, isDirty, resetRevision, sceneVersion])

  useEffect(() => {
    if (!placementToApply) return
    const entity =
      placementToApply.kind === 'zone'
        ? scene.zones.find((zone) => zone.id === placementToApply.entityId)
        : scene.racks.find((rack) => rack.id === placementToApply.entityId)
    if (!entity) return
    dispatch({
      type: 'update-geometry',
      target: placementToApply.kind,
      id: placementToApply.entityId,
      geometry: constrainLayoutGeometryToCanvas(
        {
          ...entity,
          x: placementToApply.x,
          y: placementToApply.y,
          width: placementToApply.width ?? entity.width,
          height: placementToApply.height ?? entity.height,
        },
        scene.canvas
      ),
      ...(placementToApply.kind === 'rack'
        ? { rackShape: placementToApply.layoutShape ?? 'Standard' }
        : {}),
    })
    onPlacementApplied()
  }, [dispatch, onPlacementApplied, placementToApply, scene.canvas, scene.racks, scene.zones])

  useEffect(() => {
    setWarehouseDirty(warehouseId, isDirty && canConfigure)
  }, [canConfigure, isDirty, setWarehouseDirty, warehouseId])

  useEffect(() => () => setWarehouseDirty(warehouseId, false), [setWarehouseDirty, warehouseId])

  useEffect(() => {
    if (!isDirty || !canConfigure) return
    const preventAccidentalClose = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', preventAccidentalClose)
    return () => window.removeEventListener('beforeunload', preventAccidentalClose)
  }, [canConfigure, isDirty])

  function updateGeometry(
    target: WarehouseLayoutGeometryTarget,
    id: string,
    geometry: WarehouseLayoutGeometry
  ) {
    if (!canConfigure) return
    dispatch({
      type: 'update-geometry',
      target,
      id,
      geometry: constrainLayoutGeometryToCanvas(geometry, scene.canvas),
    })
  }

  function updateColor(target: WarehouseLayoutGeometryTarget, id: string, color: string | null) {
    if (!canConfigure) return
    dispatch({ type: 'update-color', target, id, color })
  }

  function addDecoration(
    type: WarehouseLayoutDecorationType,
    label: string,
    position?: WarehouseLayoutDropPosition
  ) {
    if (!canConfigure) return
    const clientKey = createClientKey()
    const offset = scene.decorations.length * scene.canvas.gridSize
    const geometry = constrainLayoutGeometryToCanvas(
      {
        x: position?.x ?? scene.canvas.gridSize * 5 + offset,
        y: position?.y ?? scene.canvas.gridSize * 5 + offset,
        width: type === 'Aisle' ? scene.canvas.gridSize * 12 : scene.canvas.gridSize * 8,
        height: type === 'Aisle' ? scene.canvas.gridSize * 3 : scene.canvas.gridSize * 5,
        rotation: 0,
        zIndex: 500 + scene.decorations.length,
      },
      scene.canvas
    )
    dispatch({
      type: 'add-decoration',
      decoration: { id: '', clientKey, type, label, color: null, ...geometry },
    })
    setSelection({ kind: 'decoration', id: clientKey })
    setIsInspectorOpen(false)
    setIsToolboxOpen(false)
  }

  function handlePaletteDrop(payload: LayoutPaletteDragData, x: number, y: number) {
    if (!canConfigure) return
    const position = { x, y }
    if (payload.kind === 'zone') onCreateZone(position)
    else if (payload.kind === 'rack') {
      const zoneId = getSelectedZoneId()
      const rackSize = getRackPresetSize(payload.shape, scene.canvas.gridSize)
      if (zoneId)
        onCreateRack(zoneId, {
          ...position,
          ...rackSize,
          layoutShape: payload.shape ?? 'Standard',
        })
      else toast.error('Chọn một khu vực trước khi đặt kệ hàng.')
    } else addDecoration(payload.type, payload.label, position)
  }

  function getSelectedZoneId() {
    if (selection?.kind === 'zone') {
      return scene.zones.find((zone) => zone.id === selection.id && zone.status === 'Active')?.id
    }
    if (selection?.kind === 'rack') {
      const rack = scene.racks.find((candidate) => candidate.id === selection.id)
      return rack?.status === 'Active' &&
        scene.zones.some((zone) => zone.id === rack.zoneId && zone.status === 'Active')
        ? rack.zoneId
        : null
    }
    return null
  }

  function duplicateSelectedDecoration() {
    if (selection?.kind !== 'decoration' || !canConfigure) return
    const source = scene.decorations.find((decoration) => decoration.clientKey === selection.id)
    if (!source) return
    const clientKey = createClientKey()
    const geometry = constrainLayoutGeometryToCanvas(
      {
        ...source,
        x: source.x + scene.canvas.gridSize,
        y: source.y + scene.canvas.gridSize,
        zIndex: source.zIndex + 1,
      },
      scene.canvas
    )
    dispatch({
      type: 'add-decoration',
      decoration: {
        ...source,
        ...geometry,
        id: '',
        clientKey,
        label: getDuplicateLabel(source.label),
      },
    })
    setSelection({ kind: 'decoration', id: clientKey })
    setIsInspectorOpen(false)
  }

  function deleteSelectedDecoration() {
    if (selection?.kind !== 'decoration' || !canConfigure) return
    dispatch({ type: 'delete-decoration', id: selection.id })
    setSelection(null)
    setIsInspectorOpen(false)
  }

  function rotateSelectedObject() {
    if (!selection || selection.kind === 'slot' || !canConfigure) return
    const object =
      selection.kind === 'zone'
        ? scene.zones.find((zone) => zone.id === selection.id)
        : selection.kind === 'rack'
          ? scene.racks.find((rack) => rack.id === selection.id)
          : scene.decorations.find((decoration) => decoration.clientKey === selection.id)
    if (!object) return
    updateGeometry(selection.kind, selection.id, {
      ...object,
      rotation: (object.rotation + 90) % 360,
    })
  }

  function getSelectedObjectColor() {
    if (!selection || selection.kind === 'slot') return null
    if (selection.kind === 'zone') {
      return scene.zones.find((zone) => zone.id === selection.id)?.color ?? null
    }
    if (selection.kind === 'rack') {
      return scene.racks.find((rack) => rack.id === selection.id)?.color ?? null
    }
    return (
      scene.decorations.find((decoration) => decoration.clientKey === selection.id)?.color ?? null
    )
  }

  function getSelectedActiveRack() {
    if (selection?.kind !== 'rack' || !canConfigure) return null
    const rack = scene.racks.find((candidate) => candidate.id === selection.id)
    return rack?.status === 'Active' && activeZoneContainsRack(scene, rack) ? rack : null
  }

  function requestDeactivateSelectedRack() {
    const rack = getSelectedActiveRack()
    if (!rack) return
    setRackDeactivateError(null)
    setRackDeactivateTarget(rack)
  }

  async function updateSelectedRackName(rackName: string) {
    const rack = getSelectedActiveRack()
    if (!rack) return false
    try {
      await onUpdateRackName(rack, rackName.trim())
      toast.success('Đã cập nhật tên kệ hàng.')
      return true
    } catch (error) {
      logger.error(error)
      toast.error(getActionError(error, 'Không thể cập nhật tên kệ. Vui lòng thử lại.'))
      return false
    }
  }

  async function confirmDeactivateRack() {
    if (!rackDeactivateTarget) return
    try {
      await onDeactivateRack(rackDeactivateTarget)
      toast.success('Đã ngừng hoạt động kệ hàng và gỡ khỏi sơ đồ.')
      setRackDeactivateTarget(null)
      setRackDeactivateError(null)
      setSelection(null)
      setIsInspectorOpen(false)
    } catch (error) {
      logger.error(error)
      setRackDeactivateError(
        getActionError(error, 'Không thể ngừng hoạt động kệ. Vui lòng thử lại.')
      )
    }
  }

  function handleSelectionChange(nextSelection: WarehouseLayoutSelection | null) {
    setSelection(nextSelection)
    setIsInspectorOpen(false)
  }

  function handleWorkspaceKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isFormControl(event.target)) return
    if (event.key === 'Escape') {
      setSelection(null)
      setIsInspectorOpen(false)
      return
    }
    if (!canConfigure) return
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      dispatch({ type: event.shiftKey ? 'redo' : 'undo' })
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault()
      dispatch({ type: 'redo' })
      return
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && selection?.kind === 'decoration') {
      event.preventDefault()
      deleteSelectedDecoration()
    }
  }

  function closeDesigner() {
    if (isDirty) {
      setIsCloseDialogOpen(true)
      return
    }
    router.back()
  }

  function confirmCloseDesigner() {
    setIsCloseDialogOpen(false)
    router.back()
  }

  const toolbox = (
    <DesignerToolbox
      scene={scene}
      selection={selection}
      canConfigure={canConfigure}
      onCreateZone={() => {
        setIsToolboxOpen(false)
        onCreateZone()
      }}
      onCreateRack={(shape) => {
        const zoneId = getSelectedZoneId()
        if (zoneId) {
          setIsToolboxOpen(false)
          onCreateRack(
            zoneId,
            shape
              ? {
                  x: scene.canvas.gridSize * 5,
                  y: scene.canvas.gridSize * 5,
                  ...getRackPresetSize(shape, scene.canvas.gridSize),
                  layoutShape: shape,
                }
              : undefined
          )
        }
      }}
      onCreateDecoration={addDecoration}
      onSelect={(nextSelection) => {
        handleSelectionChange(nextSelection)
        setIsToolboxOpen(false)
      }}
    />
  )

  const inspector = selection ? (
    <DesignerInspector
      key={`${selection.kind}:${selection.id}`}
      scene={scene}
      selection={selection}
      canConfigure={canConfigure && isSelectionEditable(scene, selection)}
      isUpdatingRack={isUpdatingRack}
      isDeactivatingRack={isDeactivatingRack}
      onRackNameChange={updateSelectedRackName}
      onDecorationChange={(decoration) => {
        if (selection.kind === 'decoration' && canConfigure) {
          dispatch({ type: 'update-decoration', id: selection.id, decoration })
        }
      }}
      onClose={() => setIsInspectorOpen(false)}
    />
  ) : null

  const canvas = (
    <WarehouseCanvas
      ref={canvasRef}
      scene={scene}
      selection={selection}
      canConfigure={canConfigure}
      isGridVisible={isGridVisible}
      onSelect={handleSelectionChange}
      onGeometryChange={updateGeometry}
      onZoomChange={setZoomPercent}
      onPaletteDrop={handlePaletteDrop}
    />
  )

  const contextToolbar = selection ? (
    <DesignerContextToolbar
      selection={selection}
      color={getSelectedObjectColor()}
      canConfigure={canConfigure && isSelectionEditable(scene, selection)}
      canCreateRack={selection.kind === 'zone' && Boolean(getSelectedZoneId())}
      canDuplicate={selection.kind === 'decoration'}
      canRemove={selection.kind === 'decoration' || selection.kind === 'rack'}
      removeLabel={selection.kind === 'rack' ? 'Ngừng dùng' : 'Xóa'}
      onOpenDetails={() => setIsInspectorOpen(true)}
      onCreateRack={() => {
        const zoneId = getSelectedZoneId()
        if (zoneId) onCreateRack(zoneId)
      }}
      onColorChange={(color) => {
        if (selection.kind !== 'slot') updateColor(selection.kind, selection.id, color)
      }}
      onRotate={rotateSelectedObject}
      onDuplicate={duplicateSelectedDecoration}
      onRemove={() => {
        if (selection.kind === 'decoration') deleteSelectedDecoration()
        else if (selection.kind === 'rack') requestDeactivateSelectedRack()
      }}
    />
  ) : null

  return (
    <section
      className="bg-surface-container-lowest fixed inset-0 z-40 flex min-h-0 min-w-0 flex-col overflow-hidden"
      aria-label="Trình thiết kế bố cục kho"
      onKeyDown={handleWorkspaceKeyDown}
    >
      <DesignerToolbar
        title={`Thiết lập sơ đồ ${warehouseName}`}
        canvas={scene.canvas}
        isGridVisible={isGridVisible}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        isReadOnly={!canConfigure}
        onUndo={() => dispatch({ type: 'undo' })}
        onRedo={() => dispatch({ type: 'redo' })}
        onToggleGrid={() => setIsGridVisible((visible) => !visible)}
        onCanvasChange={(nextCanvas) => dispatch({ type: 'update-canvas', canvas: nextCanvas })}
        onClose={closeDesigner}
      />

      {!canConfigure ? (
        <Alert className="border-x-0 border-t-0">
          <Info aria-hidden="true" />
          <AlertTitle>Chế độ xem</AlertTitle>
          <AlertDescription>
            Bạn có thể chọn và kiểm tra đối tượng, nhưng không thể thay đổi sơ đồ.
          </AlertDescription>
        </Alert>
      ) : null}
      {saveError ? (
        <Alert variant="destructive" className="border-x-0 border-t-0">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>
            {hasConflict ? 'Sơ đồ đã được thay đổi ở nơi khác' : 'Không thể lưu sơ đồ'}
          </AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
          {hasConflict ? (
            <AlertAction>
              <Button type="button" size="xs" variant="outline" onClick={onReload}>
                <RefreshCw data-icon="inline-start" aria-hidden="true" />
                Tải bản mới
              </Button>
            </AlertAction>
          ) : null}
        </Alert>
      ) : null}

      {isCompact ? (
        <>
          <div className="flex items-center border-b px-2 py-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsInspectorOpen(false)
                setIsToolboxOpen(true)
              }}
            >
              <Boxes data-icon="inline-start" aria-hidden="true" />
              Đối tượng
            </Button>
            <span className="text-muted-foreground ml-auto text-[11px]">
              Chạm đối tượng để xem thuộc tính
            </span>
          </div>
          <div className="relative min-h-0 flex-1">
            {canvas}
            {contextToolbar ? (
              <div className="pointer-events-auto absolute top-3 left-1/2 z-20 -translate-x-1/2">
                {contextToolbar}
              </div>
            ) : null}
          </div>
          <Drawer open={isToolboxOpen} onOpenChange={setIsToolboxOpen}>
            <DrawerContent className="h-[76dvh] overscroll-contain">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Đối tượng sơ đồ</DrawerTitle>
                <DrawerDescription>Thêm hoặc chọn thành phần trong sơ đồ kho.</DrawerDescription>
              </DrawerHeader>
              <DrawerClose asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="absolute top-3 right-3 z-10"
                  aria-label="Đóng danh sách đối tượng"
                >
                  <X aria-hidden="true" />
                </Button>
              </DrawerClose>
              {toolbox}
            </DrawerContent>
          </Drawer>
          <Drawer open={Boolean(selection) && isInspectorOpen} onOpenChange={setIsInspectorOpen}>
            <DrawerContent className="h-[76dvh] overscroll-contain">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Thuộc tính đối tượng</DrawerTitle>
                <DrawerDescription>Xem và chỉnh sửa đối tượng đang chọn.</DrawerDescription>
              </DrawerHeader>
              {inspector}
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="h-0 min-h-0 min-w-0 flex-1">
          <ResizablePanel defaultSize="18%" minSize="16%" maxSize="22%">
            {toolbox}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="82%" minSize="60%">
            <div className="relative h-full min-h-0">
              {canvas}
              {contextToolbar ? (
                <div className="pointer-events-auto absolute top-4 left-1/2 z-20 -translate-x-1/2">
                  {contextToolbar}
                </div>
              ) : null}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
      <DesignerFooter
        zoomPercent={zoomPercent}
        canSave={isDirty && canConfigure}
        isSaving={isSaving}
        isReadOnly={!canConfigure}
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onFit={() => canvasRef.current?.fit()}
        onCancel={closeDesigner}
        onSave={() => onSave(scene, baseVersionRef.current)}
      />
      {!isCompact && selection && isInspectorOpen ? (
        <Drawer open onOpenChange={setIsInspectorOpen} direction="right">
          <DrawerContent className="h-dvh w-full max-w-md overscroll-contain">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Chi tiết đối tượng</DrawerTitle>
              <DrawerDescription>Xem và chỉnh sửa đối tượng đang chọn.</DrawerDescription>
            </DrawerHeader>
            {inspector}
          </DrawerContent>
        </Drawer>
      ) : null}
      <WarehouseLocationDeactivateDialog
        open={Boolean(rackDeactivateTarget)}
        locationLabel="kệ hàng"
        locationCode={rackDeactivateTarget?.rackCode ?? ''}
        isPending={isDeactivatingRack}
        errorMessage={rackDeactivateError}
        onOpenChange={(open) => {
          if (!open) {
            setRackDeactivateTarget(null)
            setRackDeactivateError(null)
          }
        }}
        onConfirm={() => void confirmDeactivateRack()}
      />
      <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ thay đổi chưa lưu?</AlertDialogTitle>
            <AlertDialogDescription>
              Các thay đổi trên sơ đồ sẽ bị mất nếu bạn đóng trang ngay bây giờ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmCloseDesigner}>
              Đóng và bỏ thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

function activeZoneContainsRack(
  scene: WarehouseLayoutEditorScene,
  rack: WarehouseLayoutEditorRack
) {
  return scene.zones.some((zone) => zone.id === rack.zoneId && zone.status === 'Active')
}

function getActionError(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message
  }
  return fallback
}

function isSelectionEditable(
  scene: WarehouseLayoutEditorScene,
  selection: WarehouseLayoutSelection
): boolean {
  if (selection.kind === 'decoration') return true
  if (selection.kind === 'zone') {
    return scene.zones.some((zone) => zone.id === selection.id && zone.status === 'Active')
  }
  if (selection.kind === 'rack') {
    const rack = scene.racks.find((candidate) => candidate.id === selection.id)
    return Boolean(
      rack?.status === 'Active' &&
      scene.zones.some((zone) => zone.id === rack.zoneId && zone.status === 'Active')
    )
  }
  return false
}
