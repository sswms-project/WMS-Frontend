'use client'

import { RefreshCw, TriangleAlert } from 'lucide-react'
import type { Route } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import type { RackResponse, SlotResponse, ZoneResponse } from '@/types/warehouse'
import {
  RackFormSheet,
  SlotFormSheet,
  WarehouseLayoutView,
  WarehouseLocationDeactivateDialog,
  ZoneFormSheet,
} from '../components/WarehouseDetailPage'
import {
  useCreateRackMutation,
  useCreateSlotMutation,
  useCreateZoneMutation,
  useDeactivateRackMutation,
  useDeactivateSlotMutation,
  useDeactivateZoneMutation,
  useUpdateRackMutation,
  useUpdateSlotMutation,
  useUpdateZoneMutation,
  useWarehouseLayoutQuery,
  useWarehouseQuery,
} from '../hooks/use-warehouse'
import type { RackFormValues, SlotFormValues, ZoneFormValues } from '../schemas/warehouse.schema'
import { getWarehouseCapabilities } from '../utils/warehouse-capabilities'
import {
  buildWarehouseLayoutHref,
  getWarehouseLayoutSelection,
} from '../utils/warehouse-layout-route'

interface WarehouseLayoutPageProps {
  readonly warehouseId: string
}

type ZoneFormTarget =
  | { readonly mode: 'create' }
  | { readonly mode: 'update'; readonly zone: ZoneResponse }
type RackFormTarget =
  | { readonly mode: 'create'; readonly zone: ZoneResponse }
  | { readonly mode: 'update'; readonly zone: ZoneResponse; readonly rack: RackResponse }
type SlotFormTarget =
  | { readonly mode: 'create'; readonly rack: RackResponse }
  | { readonly mode: 'update'; readonly rack: RackResponse; readonly slot: SlotResponse }
type DeactivateTarget =
  | { readonly type: 'Zone'; readonly zone: ZoneResponse }
  | { readonly type: 'Rack'; readonly zone: ZoneResponse; readonly rack: RackResponse }
  | { readonly type: 'Slot'; readonly rack: RackResponse; readonly slot: SlotResponse }

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

export function WarehouseLayoutPage({ warehouseId }: WarehouseLayoutPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = useAuthStore((state) => state.user?.role ?? null)
  const capabilities = getWarehouseCapabilities(role)
  const warehouseQuery = useWarehouseQuery(warehouseId)
  const layoutQuery = useWarehouseLayoutQuery(warehouseId, true)
  const createZoneMutation = useCreateZoneMutation()
  const updateZoneMutation = useUpdateZoneMutation()
  const deactivateZoneMutation = useDeactivateZoneMutation()
  const createRackMutation = useCreateRackMutation()
  const updateRackMutation = useUpdateRackMutation()
  const deactivateRackMutation = useDeactivateRackMutation()
  const createSlotMutation = useCreateSlotMutation()
  const updateSlotMutation = useUpdateSlotMutation()
  const deactivateSlotMutation = useDeactivateSlotMutation()
  const [zoneFormTarget, setZoneFormTarget] = useState<ZoneFormTarget | null>(null)
  const [rackFormTarget, setRackFormTarget] = useState<RackFormTarget | null>(null)
  const [slotFormTarget, setSlotFormTarget] = useState<SlotFormTarget | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<DeactivateTarget | null>(null)
  const [deactivateErrorMessage, setDeactivateErrorMessage] = useState<string | null>(null)

  if (layoutQuery.isLoading || warehouseQuery.isLoading) return <Skeleton className="h-[32rem]" />

  if (layoutQuery.isError || warehouseQuery.isError || !warehouseQuery.data) {
    return (
      <Empty className="min-h-72 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert className="text-destructive" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Không thể tải bố cục kho</EmptyTitle>
          <EmptyDescription>
            Dữ liệu chưa sẵn sàng hoặc bạn không có quyền truy cập.
          </EmptyDescription>
        </EmptyHeader>
        <Button
          type="button"
          onClick={() => void Promise.all([layoutQuery.refetch(), warehouseQuery.refetch()])}
        >
          <RefreshCw data-icon="inline-start" aria-hidden="true" />
          Thử lại
        </Button>
      </Empty>
    )
  }

  const zones = layoutQuery.data ?? []
  const selection = getWarehouseLayoutSelection(
    zones,
    searchParams.get('zone'),
    searchParams.get('rack')
  )
  const isWarehouseActive = warehouseQuery.data.status === 'Active'

  function navigate(zoneId: string | null, rackId: string | null) {
    router.push(buildWarehouseLayoutHref(warehouseId, zoneId, rackId), { scroll: false })
  }

  function openDeactivate(target: DeactivateTarget) {
    setDeactivateErrorMessage(null)
    setDeactivateTarget(target)
  }

  async function submitZone(values: ZoneFormValues) {
    if (!zoneFormTarget) return false
    try {
      if (zoneFormTarget.mode === 'create') {
        await createZoneMutation.mutateAsync({ warehouseId, request: values })
        toast.success('Đã thêm khu vực.')
      } else {
        await updateZoneMutation.mutateAsync({
          warehouseId,
          zoneId: zoneFormTarget.zone.id,
          request: values,
        })
        toast.success('Đã cập nhật khu vực.')
      }
      setZoneFormTarget(null)
      return true
    } catch (error) {
      logger.error(error)
      toast.error(getErrorMessage(error, 'Không thể lưu khu vực. Vui lòng thử lại.'))
      return false
    }
  }

  async function submitRack(values: RackFormValues) {
    if (!rackFormTarget) return false
    try {
      if (rackFormTarget.mode === 'create') {
        await createRackMutation.mutateAsync({
          warehouseId,
          zoneId: rackFormTarget.zone.id,
          request: values,
        })
        toast.success('Đã thêm kệ hàng.')
      } else {
        await updateRackMutation.mutateAsync({
          warehouseId,
          zoneId: rackFormTarget.zone.id,
          rackId: rackFormTarget.rack.id,
          request: values,
        })
        toast.success('Đã cập nhật kệ hàng.')
      }
      setRackFormTarget(null)
      return true
    } catch (error) {
      logger.error(error)
      toast.error(getErrorMessage(error, 'Không thể lưu kệ hàng. Vui lòng thử lại.'))
      return false
    }
  }

  async function submitSlot(values: SlotFormValues) {
    if (!slotFormTarget) return false
    try {
      if (slotFormTarget.mode === 'create') {
        await createSlotMutation.mutateAsync({
          warehouseId,
          rackId: slotFormTarget.rack.id,
          request: values,
        })
        toast.success('Đã thêm vị trí lưu trữ.')
      } else {
        await updateSlotMutation.mutateAsync({
          warehouseId,
          rackId: slotFormTarget.rack.id,
          slotId: slotFormTarget.slot.id,
          request: values,
        })
        toast.success('Đã cập nhật vị trí lưu trữ.')
      }
      setSlotFormTarget(null)
      return true
    } catch (error) {
      logger.error(error)
      toast.error(getErrorMessage(error, 'Không thể lưu vị trí. Vui lòng thử lại.'))
      return false
    }
  }

  async function confirmDeactivate() {
    if (!deactivateTarget) return
    try {
      if (deactivateTarget.type === 'Zone') {
        await deactivateZoneMutation.mutateAsync({ warehouseId, zoneId: deactivateTarget.zone.id })
      } else if (deactivateTarget.type === 'Rack') {
        await deactivateRackMutation.mutateAsync({
          warehouseId,
          zoneId: deactivateTarget.zone.id,
          rackId: deactivateTarget.rack.id,
        })
      } else {
        await deactivateSlotMutation.mutateAsync({
          warehouseId,
          rackId: deactivateTarget.rack.id,
          slotId: deactivateTarget.slot.id,
        })
      }
      toast.success('Đã ngừng hoạt động vị trí.')
      setDeactivateTarget(null)
      setDeactivateErrorMessage(null)
    } catch (error) {
      logger.error(error)
      setDeactivateErrorMessage(
        getErrorMessage(error, 'Không thể ngừng hoạt động vị trí. Vui lòng thử lại.')
      )
    }
  }

  const isDeactivating =
    deactivateZoneMutation.isPending ||
    deactivateRackMutation.isPending ||
    deactivateSlotMutation.isPending
  const deactivateCode =
    deactivateTarget?.type === 'Zone'
      ? deactivateTarget.zone.zoneCode
      : deactivateTarget?.type === 'Rack'
        ? deactivateTarget.rack.rackCode
        : (deactivateTarget?.slot.slotCode ?? '')
  const deactivateLabel =
    deactivateTarget?.type === 'Zone'
      ? 'khu vực'
      : deactivateTarget?.type === 'Rack'
        ? 'kệ hàng'
        : 'vị trí lưu trữ'

  return (
    <>
      <WarehouseLayoutView
        zones={zones}
        selectedZoneId={selection.selectedZoneId}
        selectedRackId={selection.selectedRackId}
        onSelectZone={(zoneId) => navigate(zoneId, null)}
        onSelectRack={(rackId) => navigate(selection.selectedZoneId, rackId)}
        onBackToZones={() => navigate(null, null)}
        onBackToRacks={() => navigate(selection.selectedZoneId, null)}
        canConfigure={capabilities.canConfigureLayout}
        canGenerateBarcode={capabilities.canGenerateLocationBarcode}
        isWarehouseActive={isWarehouseActive}
        onCreateZone={() => setZoneFormTarget({ mode: 'create' })}
        onCreateRack={(zone) => setRackFormTarget({ mode: 'create', zone })}
        onCreateSlot={(rack) => setSlotFormTarget({ mode: 'create', rack })}
        onEditZone={(zone) => setZoneFormTarget({ mode: 'update', zone })}
        onEditRack={(zone, rack) => setRackFormTarget({ mode: 'update', zone, rack })}
        onEditSlot={(rack, slot) => setSlotFormTarget({ mode: 'update', rack, slot })}
        onDeactivateZone={(zone) => openDeactivate({ type: 'Zone', zone })}
        onDeactivateRack={(zone, rack) => openDeactivate({ type: 'Rack', zone, rack })}
        onDeactivateSlot={(rack, slot) => openDeactivate({ type: 'Slot', rack, slot })}
        onBarcode={(type, locationId) =>
          router.push(APP_ROUTES.warehouseLocationBarcode(warehouseId, type, locationId) as Route)
        }
      />

      {zoneFormTarget ? (
        <ZoneFormSheet
          open
          mode={zoneFormTarget.mode}
          isPending={createZoneMutation.isPending || updateZoneMutation.isPending}
          defaultValues={
            zoneFormTarget.mode === 'update'
              ? {
                  zoneCode: zoneFormTarget.zone.zoneCode,
                  zoneName: zoneFormTarget.zone.zoneName,
                  description: zoneFormTarget.zone.description ?? '',
                }
              : { zoneCode: '', zoneName: '', description: '' }
          }
          onOpenChange={(open) => !open && setZoneFormTarget(null)}
          onSubmit={submitZone}
        />
      ) : null}

      {rackFormTarget ? (
        <RackFormSheet
          open
          mode={rackFormTarget.mode}
          isPending={createRackMutation.isPending || updateRackMutation.isPending}
          defaultValues={
            rackFormTarget.mode === 'update'
              ? { rackCode: rackFormTarget.rack.rackCode, rackName: rackFormTarget.rack.rackName }
              : { rackCode: '', rackName: '' }
          }
          onOpenChange={(open) => !open && setRackFormTarget(null)}
          onSubmit={submitRack}
        />
      ) : null}

      {slotFormTarget ? (
        <SlotFormSheet
          open
          mode={slotFormTarget.mode}
          isPending={createSlotMutation.isPending || updateSlotMutation.isPending}
          defaultValues={
            slotFormTarget.mode === 'update'
              ? { slotCode: slotFormTarget.slot.slotCode, capacity: slotFormTarget.slot.capacity }
              : { slotCode: '', capacity: 1 }
          }
          onOpenChange={(open) => !open && setSlotFormTarget(null)}
          onSubmit={submitSlot}
        />
      ) : null}

      <WarehouseLocationDeactivateDialog
        open={Boolean(deactivateTarget)}
        locationLabel={deactivateLabel}
        locationCode={deactivateCode}
        isPending={isDeactivating}
        errorMessage={deactivateErrorMessage}
        onOpenChange={(open) => {
          if (!open) {
            setDeactivateTarget(null)
            setDeactivateErrorMessage(null)
          }
        }}
        onConfirm={() => void confirmDeactivate()}
      />
    </>
  )
}
