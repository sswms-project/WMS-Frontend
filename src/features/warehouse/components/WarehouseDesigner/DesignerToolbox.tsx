'use client'

import {
  Box,
  ChevronRight,
  ChevronsUp,
  Columns3,
  Grid2X2,
  Layers3,
  MapPin,
  Rows3,
  SquareDashed,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type {
  WarehouseLayoutDecorationType,
  WarehouseLayoutEditorScene,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import { DECORATION_OPTIONS, writeLayoutDragData } from './designer-constants'
import type { LayoutPaletteDragData } from './designer-constants'

interface DesignerToolboxProps {
  readonly scene: WarehouseLayoutEditorScene
  readonly selection: WarehouseLayoutSelection | null
  readonly canConfigure: boolean
  readonly mode?: 'designer' | 'viewer'
  readonly onCreateZone: () => void
  readonly onCreateRack: (preset?: 'vertical' | 'horizontal' | 'double') => void
  readonly onCreateDecoration: (type: WarehouseLayoutDecorationType, label: string) => void
  readonly onSelect: (selection: WarehouseLayoutSelection) => void
}

function DisabledActionTooltip({
  label,
  disabledReason,
  disabled,
  onClick,
  icon,
  dragData,
}: {
  readonly label: string
  readonly disabledReason: string
  readonly disabled: boolean
  readonly onClick: () => void
  readonly icon: React.ReactNode
  readonly dragData: LayoutPaletteDragData
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-muted/70 hover:bg-accent size-14 rounded-md border border-transparent hover:border-current/10"
            disabled={disabled}
            draggable={!disabled}
            aria-label={label}
            onDragStart={(event) => writeLayoutDragData(event.dataTransfer, dragData)}
            onClick={onClick}
          >
            {icon}
          </Button>
        </span>
      </TooltipTrigger>
      {disabled ? <TooltipContent>{disabledReason}</TooltipContent> : null}
    </Tooltip>
  )
}

function PaletteIconAction({
  label,
  disabledReason,
  disabled,
  onClick,
  icon,
  dragData,
}: {
  readonly label: string
  readonly disabledReason: string
  readonly disabled: boolean
  readonly onClick: () => void
  readonly icon: React.ReactNode
  readonly dragData: LayoutPaletteDragData
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-muted/70 hover:bg-accent size-14 rounded-md border border-transparent hover:border-current/10 [&_svg]:size-7"
            disabled={disabled}
            draggable={!disabled}
            aria-label={label}
            onDragStart={(event) => writeLayoutDragData(event.dataTransfer, dragData)}
            onClick={onClick}
          >
            {icon}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabled ? disabledReason : label}</TooltipContent>
    </Tooltip>
  )
}

export function DesignerToolbox({
  scene,
  selection,
  canConfigure,
  mode = 'designer',
  onCreateZone,
  onCreateRack,
  onCreateDecoration,
  onSelect,
}: DesignerToolboxProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const selectedZoneCandidateId =
    selection?.kind === 'zone'
      ? selection.id
      : selection?.kind === 'rack'
        ? scene.racks.find((rack) => rack.id === selection.id)?.zoneId
        : undefined
  const selectedZoneId = scene.zones.find(
    (zone) => zone.id === selectedZoneCandidateId && zone.status === 'Active'
  )?.id
  return (
    <div className="bg-surface-container-lowest flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-4 py-4">
        <h2 className="text-base font-semibold">
          {mode === 'viewer' ? 'Danh sách vị trí' : 'Chọn biểu tượng'}
        </h2>
        {mode === 'designer' ? (
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            Nhấn hoặc kéo thả biểu tượng để thêm vào sơ đồ.
          </p>
        ) : null}
      </div>
      {mode === 'viewer' ? (
        <div className="shrink-0 px-3 pb-3">
          <Input
            type="search"
            name="warehouse-layout-location-search"
            autoComplete="off"
            value={searchTerm}
            placeholder="Tìm mã hoặc tên vị trí…"
            aria-label="Tìm vị trí trên sơ đồ"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      ) : null}
      {mode === 'designer' ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          <section aria-labelledby="business-tools-title">
            <h3
              id="business-tools-title"
              className="text-muted-foreground mb-2 text-[11px] font-medium"
            >
              Khu vực lưu trữ
            </h3>
            <div className="flex flex-wrap gap-2">
              <DisabledActionTooltip
                label="Khu vực"
                disabled={!canConfigure}
                disabledReason="Bạn chỉ có quyền xem sơ đồ."
                onClick={onCreateZone}
                dragData={{ kind: 'zone' }}
                icon={<SquareDashed className="size-7" aria-hidden="true" />}
              />
            </div>
          </section>

          <Separator className="my-4" />
          <section aria-labelledby="rack-tools-title">
            <h3
              id="rack-tools-title"
              className="text-muted-foreground mb-2 text-[11px] font-medium"
            >
              Kệ hàng
            </h3>
            <div className="flex flex-wrap gap-2">
              <PaletteIconAction
                label="Kệ dọc"
                disabled={!canConfigure || !selectedZoneId}
                disabledReason={
                  !canConfigure
                    ? 'Bạn chỉ có quyền xem sơ đồ.'
                    : 'Chọn một khu vực trước khi thêm kệ.'
                }
                onClick={() => onCreateRack('vertical')}
                dragData={{ kind: 'rack', preset: 'vertical' }}
                icon={<Columns3 aria-hidden="true" />}
              />
              <PaletteIconAction
                label="Kệ ngang"
                disabled={!canConfigure || !selectedZoneId}
                disabledReason={
                  !canConfigure
                    ? 'Bạn chỉ có quyền xem sơ đồ.'
                    : 'Chọn một khu vực trước khi thêm kệ.'
                }
                onClick={() => onCreateRack('horizontal')}
                dragData={{ kind: 'rack', preset: 'horizontal' }}
                icon={<Rows3 aria-hidden="true" />}
              />
              <PaletteIconAction
                label="Kệ hai mặt"
                disabled={!canConfigure || !selectedZoneId}
                disabledReason={
                  !canConfigure
                    ? 'Bạn chỉ có quyền xem sơ đồ.'
                    : 'Chọn một khu vực trước khi thêm kệ.'
                }
                onClick={() => onCreateRack('double')}
                dragData={{ kind: 'rack', preset: 'double' }}
                icon={<Grid2X2 aria-hidden="true" />}
              />
            </div>
          </section>

          <Separator className="my-4" />
          <section aria-labelledby="decoration-tools-title">
            <h3
              id="decoration-tools-title"
              className="text-muted-foreground mb-2 text-[11px] font-medium"
            >
              Cửa, lối đi & khu chức năng
            </h3>
            <div className="flex flex-wrap gap-2">
              {DECORATION_OPTIONS.map((option) => (
                <Tooltip key={option.type}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="bg-muted/70 hover:bg-accent size-14 rounded-md border border-transparent hover:border-current/10 [&_svg]:size-7"
                      disabled={!canConfigure}
                      draggable={canConfigure}
                      onDragStart={(event) =>
                        writeLayoutDragData(event.dataTransfer, {
                          kind: 'decoration',
                          type: option.type,
                          label: option.label,
                        })
                      }
                      aria-label={option.label}
                      onClick={() => onCreateDecoration(option.type, option.label)}
                    >
                      <option.icon aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canConfigure ? option.label : `${option.label}: Bạn chỉ có quyền xem sơ đồ.`}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {mode === 'viewer' ? (
        <section
          aria-labelledby="scene-outline-title"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <SceneOutlineTree
            scene={scene}
            selection={selection}
            mode={mode}
            query={searchTerm}
            title="Cấu trúc vị trí"
            showDecorations={false}
            onSelect={onSelect}
          />
        </section>
      ) : null}
    </div>
  )
}

type OutlineIdUpdater = (id: string, open: boolean) => void

function SceneOutlineTree({
  scene: sourceScene,
  selection,
  mode,
  query,
  title,
  showDecorations,
  onSelect,
}: Pick<DesignerToolboxProps, 'scene' | 'selection' | 'onSelect' | 'mode'> & {
  readonly query: string
  readonly title: string
  readonly showDecorations: boolean
}) {
  const scene = useMemo(() => filterOutlineScene(sourceScene, query), [query, sourceScene])
  const [openZoneIds, setOpenZoneIds] = useState<ReadonlySet<string>>(() => new Set())
  const [openRackIds, setOpenRackIds] = useState<ReadonlySet<string>>(() => new Set())
  const [isDecorationGroupOpen, setIsDecorationGroupOpen] = useState(false)
  const [isUnclassifiedGroupOpen, setIsUnclassifiedGroupOpen] = useState(false)

  const zoneIds = useMemo(() => new Set(scene.zones.map((zone) => zone.id)), [scene.zones])
  const rackIds = useMemo(() => new Set(scene.racks.map((rack) => rack.id)), [scene.racks])
  const racksByZoneId = useMemo(() => groupBy(scene.racks, (rack) => rack.zoneId), [scene.racks])
  const slotsByRackId = useMemo(() => groupBy(scene.slots, (slot) => slot.rackId), [scene.slots])
  const orphanRacks = useMemo(
    () => scene.racks.filter((rack) => !zoneIds.has(rack.zoneId)),
    [scene.racks, zoneIds]
  )
  const orphanSlots = useMemo(
    () => scene.slots.filter((slot) => !rackIds.has(slot.rackId)),
    [rackIds, scene.slots]
  )

  const selectedPath = getSelectedPath(scene, selection, zoneIds, rackIds)
  const hasQuery = Boolean(query.trim())
  const isZoneOpen = (zoneId: string) =>
    hasQuery || openZoneIds.has(zoneId) || selectedPath.zoneId === zoneId
  const isRackOpen = (rackId: string) =>
    hasQuery || openRackIds.has(rackId) || selectedPath.rackId === rackId
  const decorationGroupOpen = isDecorationGroupOpen || selection?.kind === 'decoration'
  const unclassifiedGroupOpen = isUnclassifiedGroupOpen || selectedPath.isUnclassified
  const hasManuallyExpandedGroup =
    openZoneIds.size > 0 || openRackIds.size > 0 || isDecorationGroupOpen || isUnclassifiedGroupOpen

  const updateZoneOpen: OutlineIdUpdater = (zoneId, open) =>
    setOpenZoneIds((current) => updateIdSet(current, zoneId, open))
  const updateRackOpen: OutlineIdUpdater = (rackId, open) =>
    setOpenRackIds((current) => updateIdSet(current, rackId, open))

  function collapseAll() {
    setOpenZoneIds(new Set())
    setOpenRackIds(new Set())
    setIsDecorationGroupOpen(false)
    setIsUnclassifiedGroupOpen(false)
  }

  const totalCount =
    scene.zones.length +
    scene.racks.length +
    scene.slots.length +
    (showDecorations ? scene.decorations.length : 0)

  return (
    <>
      <div className="bg-surface-container-lowest flex shrink-0 items-center justify-between gap-2 px-3 py-2.5">
        <h3 id="scene-outline-title" className="text-muted-foreground text-[11px] font-medium">
          {title}
        </h3>
        <div className="flex items-center gap-1">
          <Badge variant="outline">{totalCount}</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!hasManuallyExpandedGroup}
                  aria-label="Thu gọn tất cả"
                  onClick={collapseAll}
                >
                  <ChevronsUp aria-hidden="true" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {hasManuallyExpandedGroup
                ? 'Thu gọn tất cả'
                : selection
                  ? 'Nhánh đang chọn luôn được mở'
                  : 'Các nhóm đang được thu gọn'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1" type="always">
        <div className="px-2 pb-3">
          {totalCount === 0 ? (
            <p className="text-muted-foreground py-3 text-center text-[11px]">
              {query.trim() ? 'Không tìm thấy vị trí phù hợp.' : 'Sơ đồ chưa có đối tượng.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {scene.zones.map((zone) => {
                const racks = racksByZoneId.get(zone.id) ?? []
                return (
                  <ZoneTreeItem
                    key={zone.id}
                    zone={zone}
                    racks={racks}
                    slotsByRackId={slotsByRackId}
                    selection={selection}
                    hasStock={
                      mode === 'viewer' &&
                      scene.slots.some(
                        (slot) => slot.zoneId === zone.id && slot.currentOccupancy > 0
                      )
                    }
                    isOpen={isZoneOpen(zone.id)}
                    isRackOpen={isRackOpen}
                    onOpenChange={(open) => updateZoneOpen(zone.id, open)}
                    onRackOpenChange={updateRackOpen}
                    onSelect={onSelect}
                  />
                )
              })}

              {showDecorations && scene.decorations.length > 0 ? (
                <OutlineGroup
                  label="Khu chức năng"
                  count={scene.decorations.length}
                  icon={<Box aria-hidden="true" />}
                  open={decorationGroupOpen}
                  onOpenChange={setIsDecorationGroupOpen}
                >
                  {scene.decorations.map((decoration) => (
                    <li key={decoration.clientKey}>
                      <OutlineButton
                        label={decoration.label}
                        detail="Khu chức năng"
                        selected={
                          selection?.kind === 'decoration' && selection.id === decoration.clientKey
                        }
                        icon={<Box aria-hidden="true" />}
                        onClick={() => onSelect({ kind: 'decoration', id: decoration.clientKey })}
                      />
                    </li>
                  ))}
                </OutlineGroup>
              ) : null}

              {orphanRacks.length > 0 || orphanSlots.length > 0 ? (
                <OutlineGroup
                  label="Chưa phân loại"
                  count={orphanRacks.length + orphanSlots.length}
                  icon={<TriangleAlert aria-hidden="true" />}
                  open={unclassifiedGroupOpen}
                  onOpenChange={setIsUnclassifiedGroupOpen}
                >
                  {orphanRacks.map((rack) => (
                    <RackTreeItem
                      key={rack.id}
                      rack={rack}
                      slots={slotsByRackId.get(rack.id) ?? []}
                      selection={selection}
                      hasStock={(slotsByRackId.get(rack.id) ?? []).some(
                        (slot) => slot.currentOccupancy > 0
                      )}
                      isOpen={isRackOpen(rack.id)}
                      onOpenChange={(open) => updateRackOpen(rack.id, open)}
                      onSelect={onSelect}
                    />
                  ))}
                  {orphanSlots.map((slot) => (
                    <li key={slot.id}>
                      <OutlineButton
                        label={slot.slotCode}
                        detail="Không tìm thấy kệ hàng"
                        selected={selection?.kind === 'slot' && selection.id === slot.id}
                        hasStock={slot.currentOccupancy > 0}
                        icon={<MapPin aria-hidden="true" />}
                        onClick={() => onSelect({ kind: 'slot', id: slot.id })}
                      />
                    </li>
                  ))}
                </OutlineGroup>
              ) : null}
            </ul>
          )}
        </div>
      </ScrollArea>
    </>
  )
}

function ZoneTreeItem({
  zone,
  racks,
  slotsByRackId,
  selection,
  hasStock,
  isOpen,
  isRackOpen,
  onOpenChange,
  onRackOpenChange,
  onSelect,
}: {
  readonly zone: WarehouseLayoutEditorScene['zones'][number]
  readonly racks: WarehouseLayoutEditorScene['racks']
  readonly slotsByRackId: ReadonlyMap<string, WarehouseLayoutEditorScene['slots']>
  readonly selection: WarehouseLayoutSelection | null
  readonly hasStock: boolean
  readonly isOpen: boolean
  readonly isRackOpen: (rackId: string) => boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onRackOpenChange: OutlineIdUpdater
  readonly onSelect: DesignerToolboxProps['onSelect']
}) {
  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <div className="flex min-w-0 items-center gap-0.5">
          <OutlineToggle
            open={isOpen}
            disabled={racks.length === 0}
            label={`${isOpen ? 'Thu gọn' : 'Mở'} khu vực ${zone.zoneCode}`}
          />
          <OutlineButton
            label={zone.zoneCode}
            detail={zone.zoneName}
            count={racks.length}
            selected={selection?.kind === 'zone' && selection.id === zone.id}
            hasStock={hasStock}
            icon={<Layers3 aria-hidden="true" />}
            onClick={() => onSelect({ kind: 'zone', id: zone.id })}
          />
        </div>
        <CollapsibleContent>
          <ul className="border-border ml-3 flex flex-col gap-1 border-l pt-1 pl-1.5">
            {racks.map((rack) => (
              <RackTreeItem
                key={rack.id}
                rack={rack}
                slots={slotsByRackId.get(rack.id) ?? []}
                selection={selection}
                hasStock={(slotsByRackId.get(rack.id) ?? []).some(
                  (slot) => slot.currentOccupancy > 0
                )}
                isOpen={isRackOpen(rack.id)}
                onOpenChange={(open) => onRackOpenChange(rack.id, open)}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function RackTreeItem({
  rack,
  slots,
  selection,
  hasStock,
  isOpen,
  onOpenChange,
  onSelect,
}: {
  readonly rack: WarehouseLayoutEditorScene['racks'][number]
  readonly slots: WarehouseLayoutEditorScene['slots']
  readonly selection: WarehouseLayoutSelection | null
  readonly hasStock: boolean
  readonly isOpen: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSelect: DesignerToolboxProps['onSelect']
}) {
  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <div className="flex min-w-0 items-center gap-0.5">
          <OutlineToggle
            open={isOpen}
            disabled={slots.length === 0}
            label={`${isOpen ? 'Thu gọn' : 'Mở'} kệ hàng ${rack.rackCode}`}
          />
          <OutlineButton
            label={rack.rackCode}
            detail={rack.status === 'Active' ? rack.rackName : 'Ngừng hoạt động'}
            count={slots.length}
            selected={selection?.kind === 'rack' && selection.id === rack.id}
            hasStock={hasStock}
            icon={<Rows3 aria-hidden="true" />}
            onClick={() => onSelect({ kind: 'rack', id: rack.id })}
          />
        </div>
        <CollapsibleContent>
          <ul className="border-border ml-3 flex flex-col gap-1 border-l pt-1 pl-1.5">
            {slots.map((slot) => (
              <li key={slot.id}>
                <OutlineButton
                  label={slot.slotCode}
                  detail="Vị trí lưu trữ"
                  selected={selection?.kind === 'slot' && selection.id === slot.id}
                  hasStock={slot.currentOccupancy > 0}
                  icon={<MapPin aria-hidden="true" />}
                  onClick={() => onSelect({ kind: 'slot', id: slot.id })}
                />
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function OutlineGroup({
  label,
  count,
  icon,
  open,
  onOpenChange,
  children,
}: {
  readonly label: string
  readonly count: number
  readonly icon: React.ReactNode
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly children: React.ReactNode
}) {
  return (
    <li>
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <div className="flex min-w-0 items-center gap-0.5">
          <OutlineToggle open={open} label={`${open ? 'Thu gọn' : 'Mở'} ${label.toLowerCase()}`} />
          <div className="text-foreground flex min-h-8 min-w-0 flex-1 items-center gap-2 px-2 text-xs font-medium">
            {icon}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <Badge variant="outline">{count}</Badge>
          </div>
        </div>
        <CollapsibleContent>
          <ul className="border-border ml-3 flex flex-col gap-1 border-l pt-1 pl-1.5">
            {children}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function OutlineToggle({
  open,
  label,
  disabled = false,
}: {
  readonly open: boolean
  readonly label: string
  readonly disabled?: boolean
}) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="shrink-0"
        disabled={disabled}
        aria-label={label}
      >
        <ChevronRight
          aria-hidden="true"
          className={
            open
              ? 'rotate-90 transition-transform motion-reduce:transition-none'
              : 'transition-transform motion-reduce:transition-none'
          }
        />
      </Button>
    </CollapsibleTrigger>
  )
}

function getSelectedPath(
  scene: WarehouseLayoutEditorScene,
  selection: WarehouseLayoutSelection | null,
  zoneIds: ReadonlySet<string>,
  rackIds: ReadonlySet<string>
) {
  if (!selection) return { zoneId: null, rackId: null, isUnclassified: false }
  if (selection.kind === 'zone') {
    return { zoneId: selection.id, rackId: null, isUnclassified: false }
  }
  if (selection.kind === 'rack') {
    const rack = scene.racks.find((candidate) => candidate.id === selection.id)
    return {
      zoneId: rack?.zoneId ?? null,
      rackId: selection.id,
      isUnclassified: Boolean(rack && !zoneIds.has(rack.zoneId)),
    }
  }
  if (selection.kind === 'slot') {
    const slot = scene.slots.find((candidate) => candidate.id === selection.id)
    const rack = slot ? scene.racks.find((candidate) => candidate.id === slot.rackId) : undefined
    return {
      zoneId: rack?.zoneId ?? null,
      rackId: rack?.id ?? null,
      isUnclassified: Boolean(
        slot && (!rackIds.has(slot.rackId) || (rack && !zoneIds.has(rack.zoneId)))
      ),
    }
  }
  return { zoneId: null, rackId: null, isUnclassified: false }
}

function filterOutlineScene(scene: WarehouseLayoutEditorScene, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase('vi')
  if (!normalizedQuery) return scene
  const includesQuery = (...values: Array<string | null | undefined>) =>
    values.some((value) => value?.toLocaleLowerCase('vi').includes(normalizedQuery))

  const matchingSlotIds = new Set(
    scene.slots
      .filter((slot) => includesQuery(slot.slotCode, slot.slotName, slot.description))
      .map((slot) => slot.id)
  )
  const matchingZoneSelfIds = new Set(
    scene.zones.filter((zone) => includesQuery(zone.zoneCode, zone.zoneName)).map((zone) => zone.id)
  )
  const matchingRackIds = new Set(
    scene.racks
      .filter(
        (rack) =>
          matchingZoneSelfIds.has(rack.zoneId) ||
          includesQuery(rack.rackCode, rack.rackName, rack.description) ||
          scene.slots.some((slot) => slot.rackId === rack.id && matchingSlotIds.has(slot.id))
      )
      .map((rack) => rack.id)
  )
  const matchingZoneIds = new Set(
    scene.zones
      .filter(
        (zone) =>
          matchingZoneSelfIds.has(zone.id) ||
          scene.racks.some((rack) => rack.zoneId === zone.id && matchingRackIds.has(rack.id))
      )
      .map((zone) => zone.id)
  )

  return {
    ...scene,
    zones: scene.zones.filter((zone) => matchingZoneIds.has(zone.id)),
    racks: scene.racks.filter((rack) => matchingRackIds.has(rack.id)),
    slots: scene.slots.filter(
      (slot) => matchingSlotIds.has(slot.id) || matchingRackIds.has(slot.rackId)
    ),
    decorations: scene.decorations.filter((decoration) =>
      includesQuery(decoration.label, decoration.type)
    ),
  }
}

function groupBy<T>(items: readonly T[], getKey: (item: T) => string) {
  const groups = new Map<string, T[]>()
  items.forEach((item) => {
    const key = getKey(item)
    const group = groups.get(key)
    if (group) group.push(item)
    else groups.set(key, [item])
  })
  return groups
}

function updateIdSet(current: ReadonlySet<string>, id: string, open: boolean) {
  const next = new Set(current)
  if (open) next.add(id)
  else next.delete(id)
  return next
}

function OutlineButton({
  label,
  detail,
  selected,
  hasStock = false,
  icon,
  count,
  onClick,
}: {
  readonly label: string
  readonly detail: string
  readonly selected: boolean
  readonly hasStock?: boolean
  readonly icon: React.ReactNode
  readonly count?: number
  readonly onClick: () => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (selected) buttonRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [selected])

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-auto w-full min-w-0 justify-start border border-transparent py-1.5 [contain-intrinsic-size:32px] [content-visibility:auto]',
        selected
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
          : hasStock
            ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80'
            : 'bg-card text-card-foreground hover:bg-muted'
      )}
      aria-pressed={selected}
      onClick={onClick}
    >
      {icon}
      <span className="min-w-0 text-left">
        <span translate="no" className="block truncate font-mono text-xs">
          {label}
        </span>
        <span
          className={cn(
            'block truncate text-[10px]',
            selected ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}
        >
          {detail}
        </span>
      </span>
      {count !== undefined ? (
        <span
          className={cn(
            'ml-auto shrink-0 tabular-nums',
            selected ? 'text-primary-foreground' : 'text-muted-foreground'
          )}
        >
          {count}
        </span>
      ) : null}
    </Button>
  )
}
