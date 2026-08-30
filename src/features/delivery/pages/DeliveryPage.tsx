'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { OutboundWorkspaceNavigation } from '@/components/operations/OutboundWorkspaceNavigation'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useStaffListQuery } from '@/features/staff/hooks/use-staff'
import { STAFF_DIRECTORY_KINDS } from '@/features/staff/types/staff.types'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { useCustomersQuery } from '@/features/customer/hooks/use-customers'
import { DeliveryDetailSheet } from '../components/DeliveryDetailSheet'
import { DeliveryWorkspace } from '../components/DeliveryWorkspace'
import { UpdateDeliveryStatusDialog } from '../components/UpdateDeliveryStatusDialog'
import { useDeliveriesQuery, useUpdateDeliveryStatusMutation } from '../hooks/use-deliveries'
import {
  updateDeliveryStatusSchema,
  type UpdateDeliveryStatusFormValues,
} from '../schemas/delivery.schema'
import type { DeliveryStatus, DeliveryTracking } from '../types/delivery.types'
import { getNextDeliveryStatuses } from '../utils/delivery-format'
import { USER_ROLES } from '@/config/roles'

const PAGE_SIZE = 10

export default function DeliveryPage() {
  const meQuery = useMeQuery()
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<DeliveryStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [inspectedItem, setInspectedItem] = useState<DeliveryTracking | null>(null)
  const [updatingItem, setUpdatingItem] = useState<DeliveryTracking | null>(null)
  const [staffSearch, setStaffSearch] = useState('')
  const debouncedSearch = useDebouncedValue(searchText, 350)
  const debouncedStaffSearch = useDebouncedValue(staffSearch, 350)
  const deliveries = useDeliveriesQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(status ? { status } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(customerId ? { customerId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  })
  const warehouses = useWarehousesQuery({ top: 100, skip: 0, needTotalCount: true, isActive: true })
  const customers = useCustomersQuery({ pageNumber: 1, pageSize: 200 })
  const permissions = meQuery.data?.permissions ?? []
  const canAssignDelivery = permissions.includes('staff:view')
  const staff = useStaffListQuery(
    STAFF_DIRECTORY_KINDS.staff,
    {
      top: 200,
      skip: 0,
      needTotalCount: true,
      isActive: true,
      ...(debouncedStaffSearch.trim() ? { searchText: debouncedStaffSearch.trim() } : {}),
    },
    canAssignDelivery
  )
  const mutation = useUpdateDeliveryStatusMutation()
  const form = useForm<UpdateDeliveryStatusFormValues>({
    resolver: zodResolver(updateDeliveryStatusSchema),
    defaultValues: { newStatus: 'AssignedToTransport', note: '', assignedDeliveryStaffId: null },
  })
  const eligibleStaff = useMemo(
    () =>
      (staff.data?.items ?? [])
        .filter(
          (person) =>
            person.status === 'Active' &&
            (!updatingItem || person.assignedWarehouseIds.includes(updatingItem.warehouseId))
        )
        .map((person) => ({ id: person.id, label: `${person.fullName} · ${person.email}` })),
    [staff.data?.items, updatingItem]
  )
  const staffNames = useMemo(
    () =>
      Object.fromEntries(
        (staff.data?.items ?? []).map((person) => [person.id, person.fullName] as const)
      ),
    [staff.data?.items]
  )

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value)
    setPage(1)
  }
  function openUpdate(item: DeliveryTracking) {
    const next = getNextDeliveryStatuses(item.currentStatus)[0]
    if (!next) return
    setUpdatingItem(item)
    setStaffSearch('')
    form.reset({ newStatus: next, note: '', assignedDeliveryStaffId: item.assignedDeliveryStaffId })
  }
  function canUpdate(item: DeliveryTracking): boolean {
    if (!permissions.includes('deliveries:update')) return false
    if (meQuery.data?.role !== USER_ROLES.WarehouseStaff)
      return getNextDeliveryStatuses(item.currentStatus).length > 0
    return (
      item.assignedDeliveryStaffId === meQuery.data.id &&
      (item.currentStatus === 'AssignedToTransport' || item.currentStatus === 'Shipping')
    )
  }
  async function submit(values: UpdateDeliveryStatusFormValues) {
    if (!updatingItem) return
    try {
      await mutation.mutateAsync({
        outboundOrderId: updatingItem.outboundOrderId,
        request: {
          newStatus: values.newStatus,
          note: values.note || null,
          assignedDeliveryStaffId:
            values.newStatus === 'AssignedToTransport' ? values.assignedDeliveryStaffId : undefined,
        },
      })
      toast.success('Đã cập nhật trạng thái giao hàng.')
      setUpdatingItem(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật giao hàng.')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <OutboundWorkspaceNavigation
        currentView="delivery"
        permissions={meQuery.data?.permissions ?? []}
      />
      <DeliveryWorkspace
        items={deliveries.data?.items ?? []}
        totalCount={deliveries.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        status={status}
        warehouseId={warehouseId}
        customerId={customerId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        warehouses={(warehouses.data?.items ?? []).map((item) => ({
          id: item.id,
          label: `${item.warehouseCode} · ${item.warehouseName}`,
        }))}
        customers={(customers.data?.items ?? []).map((item) => ({
          id: item.id,
          label: `${item.customerCode} · ${item.customerName}`,
        }))}
        staffNames={staffNames}
        canUpdate={canUpdate}
        isLoading={deliveries.isLoading}
        isFetching={deliveries.isFetching}
        isError={deliveries.isError}
        onSearchChange={(value) => updateFilter(setSearchText, value)}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        onWarehouseChange={(value) => updateFilter(setWarehouseId, value)}
        onCustomerChange={(value) => updateFilter(setCustomerId, value)}
        onDateFromChange={(value) => updateFilter(setDateFrom, value)}
        onDateToChange={(value) => updateFilter(setDateTo, value)}
        onPageChange={setPage}
        onInspect={setInspectedItem}
        onUpdate={openUpdate}
        onRetry={() => void deliveries.refetch()}
      />
      <DeliveryDetailSheet
        item={inspectedItem}
        staffNames={staffNames}
        onOpenChange={(open) => {
          if (!open) setInspectedItem(null)
        }}
      />
      <UpdateDeliveryStatusDialog
        item={updatingItem}
        form={form}
        staff={eligibleStaff}
        staffSearch={staffSearch}
        onStaffSearchChange={setStaffSearch}
        isPending={mutation.isPending}
        onOpenChange={(open) => {
          if (!open) setUpdatingItem(null)
        }}
        onSubmit={submit}
      />
    </div>
  )
}
