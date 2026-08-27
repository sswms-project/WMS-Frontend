'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useInventoryQuery } from '@/features/inventory/hooks/use-inventory'
import { useStaffListQuery } from '@/features/staff/hooks/use-staff'
import { STAFF_DIRECTORY_KINDS } from '@/features/staff/types/staff.types'
import {
  useWarehouseLayoutQuery,
  useWarehousesQuery,
} from '@/features/warehouse/hooks/use-warehouse'
import { APP_ROUTES } from '@/routes/app-routes'
import { CreateCycleCountForm } from '../components/CreateCycleCountForm'
import { useCreateCycleCountMutation } from '../hooks/use-cycle-count'
import {
  createCycleCountSchema,
  type CreateCycleCountFormValues,
} from '../schemas/cycle-count.schema'

export default function CreateCycleCountPage() {
  const [inventoryPage, setInventoryPage] = useState(1)
  const router = useRouter()
  const mutation = useCreateCycleCountMutation()
  const form = useForm<CreateCycleCountFormValues>({
    resolver: zodResolver(createCycleCountSchema),
    defaultValues: {
      warehouseId: '',
      zoneId: '',
      scheduledDate: '',
      assignedTo: '',
      items: [],
      isBlindCount: true,
    },
  })
  const warehouseId = useWatch({ control: form.control, name: 'warehouseId' })
  const zoneId = useWatch({ control: form.control, name: 'zoneId' })
  const warehouses = useWarehousesQuery({ top: 100, skip: 0, needTotalCount: true, isActive: true })
  const layout = useWarehouseLayoutQuery(warehouseId, Boolean(warehouseId))
  const staff = useStaffListQuery(STAFF_DIRECTORY_KINDS.staff, {
    top: 100,
    skip: 0,
    needTotalCount: true,
  })
  const inventory = useInventoryQuery(
    {
      pageNumber: inventoryPage,
      pageSize: 50,
      warehouseId,
      ...(zoneId ? { zoneId } : {}),
    },
    Boolean(warehouseId)
  )
  const warehouseOptions = useMemo(
    () =>
      (warehouses.data?.items ?? []).map((w) => ({
        value: w.id,
        label: `${w.warehouseCode} · ${w.warehouseName}`,
      })),
    [warehouses.data?.items]
  )
  const zoneOptions = useMemo(
    () =>
      (layout.data ?? [])
        .filter((z) => z.status === 'Active')
        .map((z) => ({ value: z.id, label: `${z.zoneCode} · ${z.zoneName}` })),
    [layout.data]
  )
  const staffOptions = useMemo(
    () =>
      (staff.data?.items ?? [])
        .filter((s) => s.status === 'Active' && s.assignedWarehouseIds.includes(warehouseId))
        .map((s) => ({ value: s.id, label: `${s.fullName} · ${s.email}` })),
    [staff.data?.items, warehouseId]
  )
  async function submit(values: CreateCycleCountFormValues) {
    try {
      const response = await mutation.mutateAsync({
        ...values,
        zoneId: values.zoneId || null,
        scheduledDate: new Date(values.scheduledDate).toISOString(),
      })
      toast.success('Đã tạo phiếu kiểm kê.')
      router.push(APP_ROUTES.cycleCountDetail(response.data))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo phiếu kiểm kê.')
    }
  }
  return (
    <CreateCycleCountForm
      form={form}
      warehouses={warehouseOptions}
      zones={zoneOptions}
      staff={staffOptions}
      inventory={inventory.data?.items ?? []}
      inventoryPage={inventoryPage}
      inventoryPageSize={50}
      inventoryTotalCount={inventory.data?.totalCount ?? 0}
      isInventoryLoading={inventory.isLoading}
      isPending={mutation.isPending}
      onInventoryPageChange={setInventoryPage}
      onSubmit={submit}
    />
  )
}
