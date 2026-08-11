import {
  ArrowLeft,
  Barcode,
  Boxes,
  CircleOff,
  Edit3,
  Ellipsis,
  Layers3,
  MapPin,
  Plus,
  Warehouse,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { RackResponse, SlotResponse, ZoneResponse } from '@/types/warehouse'

interface WarehouseLayoutViewProps {
  readonly zones: readonly ZoneResponse[]
  readonly selectedZoneId: string | null
  readonly selectedRackId: string | null
  readonly onSelectZone: (zoneId: string) => void
  readonly onSelectRack: (rackId: string) => void
  readonly onBackToZones: () => void
  readonly onBackToRacks: () => void
  readonly canConfigure: boolean
  readonly canGenerateBarcode: boolean
  readonly isWarehouseActive: boolean
  readonly onCreateZone: () => void
  readonly onCreateRack: (zone: ZoneResponse) => void
  readonly onCreateSlot: (rack: RackResponse) => void
  readonly onEditZone: (zone: ZoneResponse) => void
  readonly onEditRack: (zone: ZoneResponse, rack: RackResponse) => void
  readonly onEditSlot: (rack: RackResponse, slot: SlotResponse) => void
  readonly onDeactivateZone: (zone: ZoneResponse) => void
  readonly onDeactivateRack: (zone: ZoneResponse, rack: RackResponse) => void
  readonly onDeactivateSlot: (rack: RackResponse, slot: SlotResponse) => void
  readonly onBarcode: (type: 'Zone' | 'Rack' | 'Slot', locationId: string) => void
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    Active: 'Hoạt động',
    Inactive: 'Ngừng hoạt động',
    Vacant: 'Còn trống',
    Occupied: 'Đang chứa hàng',
    Reserved: 'Đã giữ chỗ',
    Full: 'Đầy',
    Empty: 'Trống',
  }

  return labels[status] ?? status
}

function StatusBadge({ status }: { readonly status: string }) {
  return (
    <Badge variant={status === 'Inactive' ? 'destructive' : 'outline'}>
      {formatStatus(status)}
    </Badge>
  )
}

function PaneHeader({
  title,
  count,
  createLabel,
  onCreate,
}: {
  readonly title: string
  readonly count: number
  readonly createLabel?: string
  readonly onCreate?: () => void
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="tabular-nums">
          {count}
        </Badge>
        {onCreate && createLabel ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={createLabel}
                onClick={onCreate}
              >
                <Plus aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{createLabel}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  )
}

function ZoneList({
  zones,
  selectedZoneId,
  onSelectZone,
  canManage,
  canGenerateBarcode,
  onEdit,
  onDeactivate,
  onBarcode,
}: Pick<WarehouseLayoutViewProps, 'zones' | 'selectedZoneId' | 'onSelectZone'> & {
  readonly canManage: boolean
  readonly canGenerateBarcode: boolean
  readonly onEdit: (zone: ZoneResponse) => void
  readonly onDeactivate: (zone: ZoneResponse) => void
  readonly onBarcode: (locationId: string) => void
}) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <ItemGroup className="gap-1 p-2">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId

          return (
            <Item key={zone.id} variant={isSelected ? 'muted' : 'default'}>
              <button
                type="button"
                aria-pressed={isSelected}
                className="focus-visible:ring-ring flex min-w-0 flex-1 cursor-pointer items-center text-left outline-none focus-visible:ring-2"
                onClick={() => onSelectZone(zone.id)}
              >
                <ItemContent className="min-w-0">
                  <ItemTitle className="max-w-full truncate">{zone.zoneName}</ItemTitle>
                  <ItemDescription translate="no" className="font-mono">
                    {zone.zoneCode}
                  </ItemDescription>
                </ItemContent>
                <StatusBadge status={zone.status} />
              </button>
              <LocationActionMenu
                label={`Tác vụ khu vực ${zone.zoneCode}`}
                isActive={zone.status === 'Active'}
                canManage={canManage}
                canGenerateBarcode={canGenerateBarcode}
                onEdit={() => onEdit(zone)}
                onDeactivate={() => onDeactivate(zone)}
                onBarcode={() => onBarcode(zone.id)}
              />
            </Item>
          )
        })}
      </ItemGroup>
    </ScrollArea>
  )
}

function RackList({
  racks,
  selectedRackId,
  onSelectRack,
  canManage,
  canGenerateBarcode,
  isParentActive,
  onEdit,
  onDeactivate,
  onBarcode,
}: {
  readonly racks: readonly RackResponse[]
  readonly selectedRackId: string | null
  readonly onSelectRack: (rackId: string) => void
  readonly canManage: boolean
  readonly canGenerateBarcode: boolean
  readonly isParentActive: boolean
  readonly onEdit: (rack: RackResponse) => void
  readonly onDeactivate: (rack: RackResponse) => void
  readonly onBarcode: (locationId: string) => void
}) {
  if (racks.length === 0) {
    return (
      <PaneEmpty
        icon={Boxes}
        title="Chưa có kệ hàng"
        description="Khu vực này chưa được cấu hình kệ hàng."
      />
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <ItemGroup className="gap-1 p-2">
        {racks.map((rack) => {
          const isSelected = rack.id === selectedRackId

          return (
            <Item key={rack.id} variant={isSelected ? 'muted' : 'default'}>
              <button
                type="button"
                aria-pressed={isSelected}
                className="focus-visible:ring-ring flex min-w-0 flex-1 cursor-pointer items-center text-left outline-none focus-visible:ring-2"
                onClick={() => onSelectRack(rack.id)}
              >
                <ItemContent className="min-w-0">
                  <ItemTitle className="max-w-full truncate">{rack.rackName}</ItemTitle>
                  <ItemDescription translate="no" className="font-mono">
                    {rack.rackCode}
                  </ItemDescription>
                </ItemContent>
                <StatusBadge status={isParentActive ? rack.status : 'Inactive'} />
              </button>
              <LocationActionMenu
                label={`Tác vụ kệ ${rack.rackCode}`}
                isActive={isParentActive && rack.status === 'Active'}
                canManage={canManage}
                canGenerateBarcode={canGenerateBarcode}
                onEdit={() => onEdit(rack)}
                onDeactivate={() => onDeactivate(rack)}
                onBarcode={() => onBarcode(rack.id)}
              />
            </Item>
          )
        })}
      </ItemGroup>
    </ScrollArea>
  )
}

function SlotItem({
  slot,
  canManage,
  canGenerateBarcode,
  isParentActive,
  onEdit,
  onDeactivate,
  onBarcode,
}: {
  readonly slot: SlotResponse
  readonly canManage: boolean
  readonly canGenerateBarcode: boolean
  readonly isParentActive: boolean
  readonly onEdit: () => void
  readonly onDeactivate: () => void
  readonly onBarcode: () => void
}) {
  const capacity = Math.max(0, slot.capacity)
  const currentOccupancy = Math.max(0, slot.currentOccupancy)

  return (
    <Item
      role="listitem"
      aria-label={`Vị trí ${slot.slotCode}`}
      variant="outline"
      className="grid min-h-24 min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2.5 p-3"
    >
      <ItemContent className="min-w-0 self-center">
        <ItemTitle
          translate="no"
          title={slot.slotCode}
          className="block max-w-full truncate font-mono text-sm font-semibold"
        >
          {slot.slotCode}
        </ItemTitle>
      </ItemContent>
      <ItemActions className="shrink-0 gap-1">
        <StatusBadge status={isParentActive && slot.isActive ? slot.status : 'Inactive'} />
        <LocationActionMenu
          label={`Tác vụ vị trí ${slot.slotCode}`}
          isActive={isParentActive && slot.isActive}
          canManage={canManage}
          canGenerateBarcode={canGenerateBarcode}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onBarcode={onBarcode}
        />
      </ItemActions>

      <dl className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-t pt-2.5">
        <dt className="text-muted-foreground">Sức chứa</dt>
        <dd className="font-medium tabular-nums">
          {currentOccupancy} / {capacity}
        </dd>
        {slot.barcodeValue && slot.barcodeValue !== slot.slotCode && (
          <div className="col-span-2 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-muted-foreground">Barcode</dt>
            <dd translate="no" title={slot.barcodeValue} className="truncate text-right font-mono">
              {slot.barcodeValue}
            </dd>
          </div>
        )}
      </dl>
    </Item>
  )
}

function SlotList({
  slots,
  canManage,
  canGenerateBarcode,
  isParentActive,
  onEdit,
  onDeactivate,
  onBarcode,
}: {
  readonly slots: readonly SlotResponse[]
  readonly canManage: boolean
  readonly canGenerateBarcode: boolean
  readonly isParentActive: boolean
  readonly onEdit: (slot: SlotResponse) => void
  readonly onDeactivate: (slot: SlotResponse) => void
  readonly onBarcode: (slot: SlotResponse) => void
}) {
  if (slots.length === 0) {
    return (
      <PaneEmpty
        icon={MapPin}
        title="Chưa có vị trí lưu trữ"
        description="Kệ này chưa được cấu hình vị trí lưu trữ."
      />
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <ItemGroup className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {slots.map((slot) => (
          <SlotItem
            key={slot.id}
            slot={slot}
            canManage={canManage}
            canGenerateBarcode={canGenerateBarcode}
            isParentActive={isParentActive}
            onEdit={() => onEdit(slot)}
            onDeactivate={() => onDeactivate(slot)}
            onBarcode={() => onBarcode(slot)}
          />
        ))}
      </ItemGroup>
    </ScrollArea>
  )
}

function LocationActionMenu({
  label,
  isActive,
  canManage,
  canGenerateBarcode,
  onEdit,
  onDeactivate,
  onBarcode,
}: {
  readonly label: string
  readonly isActive: boolean
  readonly canManage: boolean
  readonly canGenerateBarcode: boolean
  readonly onEdit: () => void
  readonly onDeactivate: () => void
  readonly onBarcode: () => void
}) {
  if (!canManage && !canGenerateBarcode) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={label}>
          <Ellipsis aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canManage && isActive ? (
            <DropdownMenuItem onSelect={onEdit}>
              <Edit3 aria-hidden="true" />
              Chỉnh sửa
            </DropdownMenuItem>
          ) : null}
          {canGenerateBarcode && isActive ? (
            <DropdownMenuItem onSelect={onBarcode}>
              <Barcode aria-hidden="true" />
              Xem barcode
            </DropdownMenuItem>
          ) : null}
          {canManage && isActive ? (
            <DropdownMenuItem variant="destructive" onSelect={onDeactivate}>
              <CircleOff aria-hidden="true" />
              Ngừng hoạt động
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PaneEmpty({
  icon: Icon,
  title,
  description,
}: {
  readonly icon: typeof Boxes
  readonly title: string
  readonly description: string
}) {
  return (
    <Empty className="min-h-0 flex-1 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function WarehouseLayoutView({
  zones,
  selectedZoneId,
  selectedRackId,
  onSelectZone,
  onSelectRack,
  onBackToZones,
  onBackToRacks,
  canConfigure,
  canGenerateBarcode,
  isWarehouseActive,
  onCreateZone,
  onCreateRack,
  onCreateSlot,
  onEditZone,
  onEditRack,
  onEditSlot,
  onDeactivateZone,
  onDeactivateRack,
  onDeactivateSlot,
  onBarcode,
}: WarehouseLayoutViewProps) {
  if (zones.length === 0) {
    return (
      <Empty className="min-h-72 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Warehouse aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Chưa có bố cục kho</EmptyTitle>
          <EmptyDescription>
            Khu vực, kệ và vị trí sẽ hiển thị tại đây sau khi được cấu hình.
          </EmptyDescription>
        </EmptyHeader>
        {canConfigure && isWarehouseActive ? (
          <Button type="button" onClick={onCreateZone}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Thêm khu vực
          </Button>
        ) : null}
      </Empty>
    )
  }

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null
  const selectedRack = selectedZone?.racks.find((rack) => rack.id === selectedRackId) ?? null

  return (
    <div className="grid min-h-[32rem] min-w-0 overflow-hidden border lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
      <section className={cn('min-w-0 flex-col', selectedZone ? 'hidden lg:flex' : 'flex')}>
        <PaneHeader
          title="Khu vực"
          count={zones.length}
          createLabel={canConfigure && isWarehouseActive ? 'Thêm khu vực' : undefined}
          onCreate={canConfigure && isWarehouseActive ? onCreateZone : undefined}
        />
        <ZoneList
          zones={zones}
          selectedZoneId={selectedZoneId}
          onSelectZone={onSelectZone}
          canManage={canConfigure && isWarehouseActive}
          canGenerateBarcode={canGenerateBarcode}
          onEdit={onEditZone}
          onDeactivate={onDeactivateZone}
          onBarcode={(locationId) => onBarcode('Zone', locationId)}
        />
      </section>

      <section
        className={cn(
          'min-w-0 flex-col border-l',
          selectedZone && !selectedRack ? 'flex' : 'hidden lg:flex'
        )}
      >
        <div className="flex h-12 shrink-0 items-center gap-1 border-b px-2 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Quay lại danh sách khu vực"
            onClick={onBackToZones}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <span className="min-w-0 truncate text-xs font-medium">{selectedZone?.zoneName}</span>
          {canConfigure && isWarehouseActive && selectedZone?.status === 'Active' ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="ml-auto"
              aria-label="Thêm kệ hàng"
              onClick={() => onCreateRack(selectedZone)}
            >
              <Plus aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <div className="hidden lg:block">
          <PaneHeader
            title="Kệ hàng"
            count={selectedZone?.racks.length ?? 0}
            createLabel={
              canConfigure && isWarehouseActive && selectedZone?.status === 'Active'
                ? 'Thêm kệ hàng'
                : undefined
            }
            onCreate={
              canConfigure && isWarehouseActive && selectedZone?.status === 'Active'
                ? () => onCreateRack(selectedZone)
                : undefined
            }
          />
        </div>
        {selectedZone ? (
          <RackList
            racks={selectedZone.racks}
            selectedRackId={selectedRackId}
            onSelectRack={onSelectRack}
            canManage={canConfigure && isWarehouseActive && selectedZone.status === 'Active'}
            canGenerateBarcode={canGenerateBarcode && selectedZone.status === 'Active'}
            isParentActive={selectedZone.status === 'Active'}
            onEdit={(rack) => onEditRack(selectedZone, rack)}
            onDeactivate={(rack) => onDeactivateRack(selectedZone, rack)}
            onBarcode={(locationId) => onBarcode('Rack', locationId)}
          />
        ) : (
          <PaneEmpty
            icon={Layers3}
            title="Chọn khu vực"
            description="Chọn một khu vực để xem danh sách kệ hàng."
          />
        )}
      </section>

      <section
        className={cn('min-w-0 flex-col border-l', selectedRack ? 'flex' : 'hidden lg:flex')}
      >
        <div className="flex h-12 shrink-0 items-center gap-1 border-b px-2 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Quay lại danh sách kệ"
            onClick={onBackToRacks}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <span className="min-w-0 truncate text-xs font-medium">{selectedRack?.rackName}</span>
          {canConfigure &&
          isWarehouseActive &&
          selectedZone?.status === 'Active' &&
          selectedRack?.status === 'Active' ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="ml-auto"
              aria-label="Thêm vị trí lưu trữ"
              onClick={() => onCreateSlot(selectedRack)}
            >
              <Plus aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <div className="hidden lg:block">
          <PaneHeader
            title="Vị trí lưu trữ"
            count={selectedRack?.slots.length ?? 0}
            createLabel={
              canConfigure &&
              isWarehouseActive &&
              selectedZone?.status === 'Active' &&
              selectedRack?.status === 'Active'
                ? 'Thêm vị trí lưu trữ'
                : undefined
            }
            onCreate={
              canConfigure &&
              isWarehouseActive &&
              selectedZone?.status === 'Active' &&
              selectedRack?.status === 'Active'
                ? () => onCreateSlot(selectedRack)
                : undefined
            }
          />
        </div>
        {selectedRack ? (
          <SlotList
            slots={selectedRack.slots}
            canManage={
              canConfigure &&
              isWarehouseActive &&
              selectedZone?.status === 'Active' &&
              selectedRack.status === 'Active'
            }
            canGenerateBarcode={
              canGenerateBarcode &&
              selectedZone?.status === 'Active' &&
              selectedRack.status === 'Active'
            }
            isParentActive={selectedZone?.status === 'Active' && selectedRack.status === 'Active'}
            onEdit={(slot) => onEditSlot(selectedRack, slot)}
            onDeactivate={(slot) => onDeactivateSlot(selectedRack, slot)}
            onBarcode={(slot) => onBarcode('Slot', slot.id)}
          />
        ) : (
          <PaneEmpty
            icon={MapPin}
            title="Chọn kệ hàng"
            description="Chọn một kệ để xem các vị trí lưu trữ."
          />
        )}
      </section>
    </div>
  )
}
