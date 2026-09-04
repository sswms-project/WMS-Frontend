'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { USER_ROLES } from '@/config/roles'
import { getApiErrorMessage } from '@/lib/api-error'
import { useSendInvitationMutation } from '../../hooks/use-invitations'
import { useAssignmentWarehousesQuery } from '../../hooks/use-manager-assignment'
import {
  inviteWithWarehouseSchema,
  type InviteWithWarehouseFormValues,
} from '../../schemas/invite-with-warehouse.schema'
import { getActiveWarehouses } from '../../utils/active-warehouses'
import { InviteStaffDialog } from './InviteStaffDialog'
import type { WarehouseSummaryResponse } from '../../types/manager-assignment.types'

const warehousePageSize = 100

export function StaffInvitation({
  canInviteManagers,
  onClose,
}: {
  readonly canInviteManagers: boolean
  readonly onClose: () => void
}) {
  const [page, setPage] = useState(1)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseSummaryResponse | null>(null)
  const form = useForm<InviteWithWarehouseFormValues>({
    resolver: zodResolver(inviteWithWarehouseSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      role: canInviteManagers ? USER_ROLES.WarehouseManager : USER_ROLES.WarehouseStaff,
      warehouseId: '',
    },
  })
  const warehouses = useAssignmentWarehousesQuery(
    {
      top: warehousePageSize,
      skip: (page - 1) * warehousePageSize,
      needTotalCount: true,
      status: 'Active',
    },
    true
  )
  const activeWarehouses = getActiveWarehouses(warehouses.data?.items ?? [])
  const options =
    selectedWarehouse &&
    !activeWarehouses.some((warehouse) => warehouse.id === selectedWarehouse.id)
      ? [selectedWarehouse, ...activeWarehouses]
      : activeWarehouses
  const mutation = useSendInvitationMutation()
  async function submit(values: InviteWithWarehouseFormValues) {
    try {
      await mutation.mutateAsync(values)
      toast.success(`Đã gửi lời mời đến ${values.email}.`)
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể gửi lời mời.'))
    }
  }
  return (
    <InviteStaffDialog
      open
      canInviteManagers={canInviteManagers}
      form={form}
      warehouses={options}
      warehousePage={page}
      warehousePageSize={warehousePageSize}
      warehouseTotalCount={warehouses.data?.totalCount ?? 0}
      onWarehousePage={setPage}
      onWarehouseChange={(id) => {
        setSelectedWarehouse(options.find((warehouse) => warehouse.id === id) ?? null)
        form.setValue('warehouseId', id, { shouldValidate: true, shouldDirty: true })
      }}
      isLoading={warehouses.isLoading || warehouses.isFetching}
      isError={warehouses.isError}
      isPending={mutation.isPending}
      errorMessage={mutation.error ? getApiErrorMessage(mutation.error) : undefined}
      onRefresh={() => void warehouses.refetch()}
      onOpenChange={(open) => !open && onClose()}
      onSubmit={(values) => void submit(values)}
    />
  )
}
