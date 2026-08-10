import { ArrowLeft, Boxes, Layers3, MapPin, Warehouse } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
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

function PaneHeader({ title, count }: { readonly title: string; readonly count: number }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <Badge variant="secondary" className="tabular-nums">
        {count}
      </Badge>
    </div>
  )
}

function ZoneList({
  zones,
  selectedZoneId,
  onSelectZone,
}: Pick<WarehouseLayoutViewProps, 'zones' | 'selectedZoneId' | 'onSelectZone'>) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <ItemGroup className="gap-1 p-2">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId

          return (
            <Item key={zone.id} asChild variant={isSelected ? 'muted' : 'default'}>
              <button
                type="button"
                aria-pressed={isSelected}
                className="hover:bg-muted cursor-pointer text-left"
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
}: {
  readonly racks: readonly RackResponse[]
  readonly selectedRackId: string | null
  readonly onSelectRack: (rackId: string) => void
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
            <Item key={rack.id} asChild variant={isSelected ? 'muted' : 'default'}>
              <button
                type="button"
                aria-pressed={isSelected}
                className="hover:bg-muted cursor-pointer text-left"
                onClick={() => onSelectRack(rack.id)}
              >
                <ItemContent className="min-w-0">
                  <ItemTitle className="max-w-full truncate">{rack.rackName}</ItemTitle>
                  <ItemDescription translate="no" className="font-mono">
                    {rack.rackCode}
                  </ItemDescription>
                </ItemContent>
                <StatusBadge status={rack.status} />
              </button>
            </Item>
          )
        })}
      </ItemGroup>
    </ScrollArea>
  )
}

function SlotItem({ slot }: { readonly slot: SlotResponse }) {
  return (
    <Item variant="outline" className="items-start">
      <ItemContent className="min-w-0">
        <ItemTitle translate="no" className="font-mono">
          {slot.slotCode}
        </ItemTitle>
        <ItemDescription className="flex justify-between gap-3">
          <span>Sức chứa</span>
          <span className="text-foreground font-medium tabular-nums">
            {slot.currentOccupancy} / {slot.capacity}
          </span>
        </ItemDescription>
        {slot.barcodeValue && slot.barcodeValue !== slot.slotCode && (
          <ItemDescription translate="no" className="font-mono break-all">
            {slot.barcodeValue}
          </ItemDescription>
        )}
      </ItemContent>
      <StatusBadge status={slot.status} />
    </Item>
  )
}

function SlotList({ slots }: { readonly slots: readonly SlotResponse[] }) {
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
          <SlotItem key={slot.id} slot={slot} />
        ))}
      </ItemGroup>
    </ScrollArea>
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
      </Empty>
    )
  }

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null
  const selectedRack = selectedZone?.racks.find((rack) => rack.id === selectedRackId) ?? null

  return (
    <div className="grid min-h-[32rem] min-w-0 overflow-hidden border lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
      <section className={cn('min-w-0 flex-col', selectedZone ? 'hidden lg:flex' : 'flex')}>
        <PaneHeader title="Khu vực" count={zones.length} />
        <ZoneList zones={zones} selectedZoneId={selectedZoneId} onSelectZone={onSelectZone} />
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
        </div>
        <div className="hidden lg:block">
          <PaneHeader title="Kệ hàng" count={selectedZone?.racks.length ?? 0} />
        </div>
        {selectedZone ? (
          <RackList
            racks={selectedZone.racks}
            selectedRackId={selectedRackId}
            onSelectRack={onSelectRack}
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
        </div>
        <div className="hidden lg:block">
          <PaneHeader title="Vị trí lưu trữ" count={selectedRack?.slots.length ?? 0} />
        </div>
        {selectedRack ? (
          <SlotList slots={selectedRack.slots} />
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
