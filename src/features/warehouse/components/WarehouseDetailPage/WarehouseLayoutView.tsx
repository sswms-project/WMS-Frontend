import { Boxes, Layers3, Warehouse } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { RackResponse, ZoneResponse } from '@/types/warehouse'

interface WarehouseLayoutViewProps {
  readonly zones: readonly ZoneResponse[]
}

function formatOccupancy(currentOccupancy: number, capacity: number) {
  return `${currentOccupancy}/${capacity}`
}

function formatStatus(status: string) {
  return status === 'Active' ? 'Hoạt động' : status
}

function RackRow({ rack }: { readonly rack: RackResponse }) {
  return (
    <div className="border-border min-w-0 border px-3 py-2.5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{rack.rackName}</p>
          <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">{rack.rackCode}</p>
        </div>
        <Badge variant={rack.status === 'Active' ? 'outline' : 'destructive'}>
          {formatStatus(rack.status)}
        </Badge>
      </div>
      {rack.slots.length > 0 ? (
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rack.slots.map((slot) => (
            <li key={slot.id} className="bg-muted min-w-0 px-2.5 py-2">
              <p className="truncate font-mono text-xs font-medium">{slot.slotCode}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Sức chứa: {formatOccupancy(slot.currentOccupancy, slot.capacity)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-3 text-xs">Chưa có vị trí lưu trữ.</p>
      )}
    </div>
  )
}

export function WarehouseLayoutView({ zones }: WarehouseLayoutViewProps) {
  if (zones.length === 0) {
    return (
      <Empty className="min-h-52">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Warehouse className="text-muted-foreground" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Chưa có bố cục kho</EmptyTitle>
          <EmptyDescription>
            Bố cục zone, kệ và vị trí sẽ hiển thị tại đây sau khi được cấu hình.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Accordion type="multiple" defaultValue={zones.map((zone) => zone.id)} className="border">
      {zones.map((zone) => (
        <AccordionItem key={zone.id} value={zone.id} className="px-3 sm:px-4">
          <AccordionTrigger>
            <span className="flex min-w-0 items-center gap-2">
              <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center">
                <Layers3 aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm">{zone.zoneName}</span>
                <span className="text-muted-foreground mt-0.5 block truncate font-mono text-xs">
                  {zone.zoneCode}
                </span>
              </span>
              <Badge variant={zone.status === 'Active' ? 'outline' : 'destructive'}>
                {formatStatus(zone.status)}
              </Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pt-1">
              {zone.description && (
                <p className="text-muted-foreground text-xs">{zone.description}</p>
              )}
              {zone.racks.length > 0 ? (
                zone.racks.map((rack) => <RackRow key={rack.id} rack={rack} />)
              ) : (
                <div className="bg-muted text-muted-foreground flex items-center gap-2 px-3 py-2.5 text-xs">
                  <Boxes aria-hidden="true" />
                  Chưa có kệ trong khu vực này.
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
