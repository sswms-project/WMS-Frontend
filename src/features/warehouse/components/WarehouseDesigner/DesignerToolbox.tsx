'use client'

import {
  Box,
  ChevronRight,
  ChevronsUp,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type {
  WarehouseLayoutDecorationType,
  WarehouseLayoutEditorScene,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import { DECORATION_OPTIONS } from './designer-constants'

interface DesignerToolboxProps {
  readonly scene: WarehouseLayoutEditorScene
  readonly selection: WarehouseLayoutSelection | null
  readonly canConfigure: boolean
  readonly onCreateZone: () => void
  readonly onCreateRack: () => void
  readonly onCreateDecoration: (type: WarehouseLayoutDecorationType, label: string) => void
  readonly onSelect: (selection: WarehouseLayoutSelection) => void
}

function DisabledActionTooltip({
  label,
  disabledReason,
  disabled,
  onClick,
  icon,
}: {
  readonly label: string
  readonly disabledReason: string
  readonly disabled: boolean
  readonly onClick: () => void
  readonly icon: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled={disabled}
            onClick={onClick}
          >
            {icon}
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      {disabled ? <TooltipContent>{disabledReason}</TooltipContent> : null}
    </Tooltip>
  )
}

export function DesignerToolbox({
  scene,
  selection,
  canConfigure,
  onCreateZone,
  onCreateRack,
  onCreateDecoration,
  onSelect,
}: DesignerToolboxProps) {
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
      <div className="shrink-0 px-3 py-3">
        <h2 className="text-sm font-semibold">Đối tượng</h2>
        <p className="text-muted-foreground mt-0.5 text-[11px]">Thêm và chọn thành phần sơ đồ.</p>
      </div>
      <div className="shrink-0 px-3 pb-3">
        <section aria-labelledby="business-tools-title">
          <h3
            id="business-tools-title"
            className="text-muted-foreground mb-2 text-[11px] font-medium"
          >
            Cấu trúc kho
          </h3>
          <div className="flex flex-col gap-1.5">
            <DisabledActionTooltip
              label="Khu vực"
              disabled={!canConfigure}
              disabledReason="Bạn chỉ có quyền xem sơ đồ."
              onClick={onCreateZone}
              icon={<SquareDashed data-icon="inline-start" aria-hidden="true" />}
            />
            <DisabledActionTooltip
              label="Kệ hàng"
              disabled={!canConfigure || !selectedZoneId}
              disabledReason={
                !canConfigure
                  ? 'Bạn chỉ có quyền xem sơ đồ.'
                  : 'Chọn một khu vực trước khi thêm kệ.'
              }
              onClick={onCreateRack}
              icon={<Rows3 data-icon="inline-start" aria-hidden="true" />}
            />
          </div>
        </section>

        <Separator className="my-3" />
        <section aria-labelledby="decoration-tools-title">
          <h3
            id="decoration-tools-title"
            className="text-muted-foreground mb-2 text-[11px] font-medium"
          >
            Khu chức năng
          </h3>
          <div className="grid grid-cols-[repeat(4,2.25rem)] gap-1">
            {DECORATION_OPTIONS.map((option) => (
              <Tooltip key={option.type}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-sm"
                    disabled={!canConfigure}
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

      <Separator />
      <section
        aria-labelledby="scene-outline-title"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <SceneOutlineTree scene={scene} selection={selection} onSelect={onSelect} />
      </section>
    </div>
  )
}

type OutlineIdUpdater = (id: string, open: boolean) => void

function SceneOutlineTree({
  scene,
  selection,
  onSelect,
}: Pick<DesignerToolboxProps, 'scene' | 'selection' | 'onSelect'>) {
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
  const isZoneOpen = (zoneId: string) => openZoneIds.has(zoneId) || selectedPath.zoneId === zoneId
  const isRackOpen = (rackId: string) => openRackIds.has(rackId) || selectedPath.rackId === rackId
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
    scene.zones.length + scene.racks.length + scene.slots.length + scene.decorations.length

  return (
    <>
      <div className="bg-surface-container-lowest flex shrink-0 items-center justify-between gap-2 px-3 py-2.5">
        <h3 id="scene-outline-title" className="text-muted-foreground text-[11px] font-medium">
          Danh sách sơ đồ
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
              Sơ đồ chưa có đối tượng.
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
                    isOpen={isZoneOpen(zone.id)}
                    isRackOpen={isRackOpen}
                    onOpenChange={(open) => updateZoneOpen(zone.id, open)}
                    onRackOpenChange={updateRackOpen}
                    onSelect={onSelect}
                  />
                )
              })}

              {scene.decorations.length > 0 ? (
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
  isOpen,
  onOpenChange,
  onSelect,
}: {
  readonly rack: WarehouseLayoutEditorScene['racks'][number]
  readonly slots: WarehouseLayoutEditorScene['slots']
  readonly selection: WarehouseLayoutSelection | null
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
          className={open ? 'rotate-90 transition-transform' : 'transition-transform'}
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
  icon,
  count,
  onClick,
}: {
  readonly label: string
  readonly detail: string
  readonly selected: boolean
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
      variant={selected ? 'secondary' : 'ghost'}
      size="sm"
      className="h-auto w-full min-w-0 justify-start py-1.5 [contain-intrinsic-size:32px] [content-visibility:auto]"
      aria-pressed={selected}
      onClick={onClick}
    >
      {icon}
      <span className="min-w-0 text-left">
        <span translate="no" className="block truncate font-mono text-xs">
          {label}
        </span>
        <span className="text-muted-foreground block truncate text-[10px]">{detail}</span>
      </span>
      {count !== undefined ? (
        <span className="text-muted-foreground ml-auto shrink-0 tabular-nums">{count}</span>
      ) : null}
    </Button>
  )
}
