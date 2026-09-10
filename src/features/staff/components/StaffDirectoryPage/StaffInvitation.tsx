'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { USER_ROLES } from '@/config/roles'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useSendInvitationMutation } from '../../hooks/use-invitations'
import { useInvitationWarehousesInfiniteQuery } from '../../hooks/use-manager-assignment'
import {
  inviteWithWarehouseSchema,
  type InviteWithWarehouseFormValues,
} from '../../schemas/invite-with-warehouse.schema'
import { getActiveWarehouses } from '../../utils/active-warehouses'
import type { WarehouseSummaryResponse } from '../../types/manager-assignment.types'
import { InviteStaffDialog } from './InviteStaffDialog'

export function StaffInvitation({
  canInviteManagers,
  onClose,
}: {
  readonly canInviteManagers: boolean
  readonly onClose: () => void
}) {
  const [warehouseSearch, setWarehouseSearch] = useState('')
  const [selectedWarehouses, setSelectedWarehouses] = useState<WarehouseSummaryResponse[]>([])
  const debouncedWarehouseSearch = useDebouncedValue(warehouseSearch.trim(), 300)
  const form = useForm<InviteWithWarehouseFormValues>({
    resolver: zodResolver(inviteWithWarehouseSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      role: canInviteManagers ? USER_ROLES.WarehouseManager : USER_ROLES.WarehouseStaff,
      warehouseIds: [],
    },
  })
  const warehouses = useInvitationWarehousesInfiniteQuery(debouncedWarehouseSearch)
  const activeWarehouses = getActiveWarehouses(
    warehouses.data?.pages.flatMap((page) => page.items) ?? []
  )
  const mutation = useSendInvitationMutation()

  function updateWarehouseSelection(warehouse: WarehouseSummaryResponse, selected: boolean) {
    setSelectedWarehouses((current) =>
      selected
        ? current.some((item) => item.id === warehouse.id)
          ? current
          : [...current, warehouse]
        : current.filter((item) => item.id !== warehouse.id)
    )
  }

  function removeWarehouse(warehouseId: string) {
    form.setValue(
      'warehouseIds',
      form.getValues('warehouseIds').filter((id) => id !== warehouseId),
      { shouldDirty: true, shouldValidate: true }
    )
    setSelectedWarehouses((current) => current.filter((item) => item.id !== warehouseId))
  }
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
      warehouses={activeWarehouses}
      selectedWarehouses={selectedWarehouses}
      warehouseSearch={warehouseSearch}
      isLoading={warehouses.isLoading}
      isFetchingNextPage={warehouses.isFetchingNextPage}
      hasNextPage={warehouses.hasNextPage}
      isError={warehouses.isError}
      isPending={mutation.isPending}
      errorMessage={mutation.error ? getApiErrorMessage(mutation.error) : undefined}
      onRefresh={() => void warehouses.refetch()}
      onWarehouseSearchChange={setWarehouseSearch}
      onLoadMore={() => void warehouses.fetchNextPage()}
      onWarehouseSelectionChange={updateWarehouseSelection}
      onRemoveWarehouse={removeWarehouse}
      onOpenChange={(open) => !open && onClose()}
      onSubmit={(values) => void submit(values)}
    />
  )
}
