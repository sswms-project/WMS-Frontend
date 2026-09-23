'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { UnitCatalog } from '../components/UnitCatalogPage'
import {
  useChangeUnitStatusMutation,
  useCreateUnitMutation,
  useUnitsQuery,
  useUpdateUnitMutation,
} from '../hooks/use-products'
import { unitSchema, type UnitFormValues } from '../schemas/master-data.schema'
import type { UnitResponse } from '../types/product.types'

export default function UnitCatalogPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UnitResponse | null>(null)
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitCode: '',
      unitName: '',
      symbol: '',
      quantityPrecision: 0,
      description: '',
    },
  })
  const unitsQuery = useUnitsQuery()
  const meQuery = useMeQuery()
  const createMutation = useCreateUnitMutation()
  const updateMutation = useUpdateUnitMutation()
  const statusMutation = useChangeUnitStatusMutation()
  const canManage = (meQuery.data?.permissions ?? []).includes(P.UNITS_MANAGE)

  function openCreate() {
    setEditingUnit(null)
    form.reset({
      unitCode: '',
      unitName: '',
      symbol: '',
      quantityPrecision: 0,
      description: '',
    })
    setIsFormOpen(true)
  }

  function openEdit(unit: UnitResponse) {
    setEditingUnit(unit)
    form.reset({
      unitCode: unit.unitCode,
      unitName: unit.unitName,
      symbol: unit.symbol ?? '',
      quantityPrecision: unit.quantityPrecision,
      description: unit.description ?? '',
    })
    setIsFormOpen(true)
  }

  async function save(values: UnitFormValues) {
    const request = {
      ...values,
      symbol: values.symbol || null,
      description: values.description || null,
    }
    try {
      if (editingUnit) {
        await updateMutation.mutateAsync({ id: editingUnit.id, request })
        toast.success('Đã cập nhật đơn vị tính.')
      } else {
        await createMutation.mutateAsync(request)
        toast.success('Đã thêm đơn vị tính.')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể lưu đơn vị tính. Vui lòng thử lại.'))
    }
  }

  async function changeStatus(unit: UnitResponse) {
    const nextStatus = unit.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await statusMutation.mutateAsync({ id: unit.id, status: nextStatus })
      toast.success(nextStatus === 'Active' ? 'Đã kích hoạt đơn vị tính.' : 'Đã ngừng đơn vị tính.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thay đổi trạng thái đơn vị tính.'))
    }
  }

  return (
    <UnitCatalog
      items={unitsQuery.data ?? []}
      editingUnit={editingUnit}
      form={form}
      isFormOpen={isFormOpen}
      canManage={canManage}
      isLoading={unitsQuery.isLoading}
      isError={unitsQuery.isError}
      isPending={createMutation.isPending || updateMutation.isPending || statusMutation.isPending}
      onRetry={() => void unitsQuery.refetch()}
      onCreate={openCreate}
      onEdit={openEdit}
      onFormOpenChange={setIsFormOpen}
      onSubmit={(values) => void save(values)}
      onChangeStatus={(unit) => void changeStatus(unit)}
    />
  )
}
