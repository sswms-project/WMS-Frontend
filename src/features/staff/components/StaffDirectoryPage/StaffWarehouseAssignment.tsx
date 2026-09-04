'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { USER_ROLES } from '@/config/roles'
import { getApiErrorMessage } from '@/lib/api-error'
import {
  useStaffWarehouseAssignmentsQuery,
  useUpdateStaffWarehousesMutation,
} from '../../hooks/use-manager-assignment'
import {
  createStaffWarehouseFormSchema,
  type UpdateStaffWarehousesRequest,
} from '../../schemas/update-staff-warehouses.schema'
import type { StaffWarehouseAssignments } from '../../types/manager-assignment.types'
import type { StaffResponse } from '../../types/staff.types'
import { StaffWarehouseAssignmentDialog } from './StaffWarehouseAssignmentDialog'

interface StaffWarehouseAssignmentProps {
  readonly person: StaffResponse
  readonly onClose: () => void
}

function assignmentVersion(data: StaffWarehouseAssignments) {
  return JSON.stringify({
    assigned: [...data.assignedWarehouseIds].sort(),
    warehouses: data.warehouses
      .map(({ id, status, managerId }) => ({ id, status, managerId }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  })
}

export function StaffWarehouseAssignment({ person, onClose }: StaffWarehouseAssignmentProps) {
  const query = useStaffWarehouseAssignmentsQuery(person.id)
  const mutation = useUpdateStaffWarehousesMutation(person.id)
  const [snapshot, setSnapshot] = useState<StaffWarehouseAssignments | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const warehouses = snapshot?.warehouses ?? query.data?.warehouses ?? []
  const isManager = person.role === USER_ROLES.WarehouseManager
  const form = useForm<UpdateStaffWarehousesRequest>({
    resolver: zodResolver(
      createStaffWarehouseFormSchema(
        isManager,
        warehouses
          .filter((warehouse) => warehouse.status === 'Active')
          .map((warehouse) => warehouse.id)
      )
    ),
    mode: 'onChange',
    defaultValues: { warehouseIds: [], expectedWarehouseIds: [], replacements: [] },
  })
  const values = useWatch({ control: form.control })
  const selectedIds = snapshot
    ? (values.warehouseIds ?? [])
    : (query.data?.assignedWarehouseIds ?? [])
  const replacements = isManager
    ? warehouses.filter(
        (warehouse) =>
          selectedIds.includes(warehouse.id) &&
          warehouse.managerId &&
          warehouse.managerId !== person.id
      )
    : []
  const confirmed =
    replacements.length > 0 &&
    replacements.every((warehouse) =>
      values.replacements?.some(
        (item) => item.warehouseId === warehouse.id && item.managerId === warehouse.managerId
      )
    )
  const stale = Boolean(
    snapshot && query.data && assignmentVersion(snapshot) !== assignmentVersion(query.data)
  )
  const initialIds = snapshot?.assignedWarehouseIds ?? query.data?.assignedWarehouseIds ?? []
  const changed =
    selectedIds.length !== initialIds.length || selectedIds.some((id) => !initialIds.includes(id))
  const visible = warehouses.filter((warehouse) =>
    (warehouse.warehouseName + ' ' + warehouse.warehouseCode)
      .toLocaleLowerCase('vi')
      .includes(search.trim().toLocaleLowerCase('vi'))
  )
  const canSave =
    Boolean(snapshot) &&
    !stale &&
    !refreshing &&
    !query.isError &&
    !query.isFetching &&
    changed &&
    form.formState.isValid &&
    (replacements.length === 0 || confirmed) &&
    mutation.error?.statusCode !== 409

  async function save(request: UpdateStaffWarehousesRequest) {
    if (!canSave || mutation.isPending) return
    try {
      await mutation.mutateAsync(request)
      toast.success('Đã cập nhật phân công kho.')
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật phân công.'))
    }
  }

  async function refresh() {
    setRefreshing(true)
    try {
      const result = await query.refetch()
      if (result.isError || !result.data) return
      mutation.reset()
      setSnapshot(null)
      form.reset({ warehouseIds: [], expectedWarehouseIds: [], replacements: [] })
      setPage(1)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <StaffWarehouseAssignmentDialog
      form={form}
      person={person}
      warehouses={visible.slice((page - 1) * 20, page * 20)}
      selectedIds={selectedIds}
      replacements={replacements}
      confirmed={confirmed && !stale}
      search={search}
      page={page}
      totalCount={visible.length}
      isLoading={query.isFetching || refreshing}
      isError={query.isError}
      isStale={stale}
      isPending={mutation.isPending}
      canSave={canSave}
      errorMessage={
        stale
          ? 'Phân công kho đã thay đổi. Tải lại dữ liệu và xác nhận lại trước khi lưu.'
          : mutation.error
            ? getApiErrorMessage(mutation.error)
            : undefined
      }
      onSearch={(value) => {
        setSearch(value)
        setPage(1)
      }}
      onPage={setPage}
      onConfirm={(checked) => {
        if (stale || mutation.isPending || refreshing) return
        form.setValue(
          'replacements',
          checked
            ? replacements.flatMap((warehouse) =>
                warehouse.managerId
                  ? [{ warehouseId: warehouse.id, managerId: warehouse.managerId }]
                  : []
              )
            : [],
          { shouldValidate: true }
        )
      }}
      onToggle={(id) => {
        if (stale || mutation.isPending || query.isFetching || refreshing || !query.data) return
        if (!snapshot) {
          setSnapshot(structuredClone(query.data))
          form.setValue('expectedWarehouseIds', [...query.data.assignedWarehouseIds])
        }
        form.setValue('replacements', [])
        form.setValue(
          'warehouseIds',
          selectedIds.includes(id)
            ? selectedIds.filter((value) => value !== id)
            : [...selectedIds, id],
          { shouldValidate: true, shouldDirty: true }
        )
      }}
      onRefresh={() => void refresh()}
      onClose={onClose}
      onSave={() => void form.handleSubmit(save)()}
    />
  )
}
