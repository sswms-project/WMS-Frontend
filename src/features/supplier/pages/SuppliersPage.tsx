'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { logger } from '@/lib/logger'
import {
  SupplierCreateDialog,
  SupplierDeactivateDialog,
  SupplierDirectory,
  SupplierEditDialog,
  SupplierReactivateDialog,
} from '../components/SuppliersPage'
import {
  useCreateSupplierMutation,
  useDeactivateSupplierMutation,
  useReactivateSupplierMutation,
  useSuppliersQuery,
  useUpdateSupplierMutation,
} from '../hooks/use-suppliers'
import type { SaveSupplierFormValues } from '../schemas/supplier.schema'
import type { SaveSupplierRequest, Supplier, SupplierStatus } from '../types/supplier.types'
import { getApiErrorMessage } from '../utils/supplier-error'

const PAGE_SIZE = 10

function toSaveRequest(values: SaveSupplierFormValues): SaveSupplierRequest {
  return {
    supplierName: values.supplierName,
    phone: values.phone,
    email: values.email || null,
    address: values.address || null,
  }
}

export default function SuppliersPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<SupplierStatus | ''>('')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null)
  const [supplierToDeactivate, setSupplierToDeactivate] = useState<Supplier | null>(null)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)
  const [supplierToReactivate, setSupplierToReactivate] = useState<Supplier | null>(null)
  const [reactivateError, setReactivateError] = useState<string | null>(null)

  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const meQuery = useMeQuery()
  const permissions = meQuery.data?.permissions ?? []

  const query = useSuppliersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(status ? { status } : {}),
  })

  const createMutation = useCreateSupplierMutation()
  const updateMutation = useUpdateSupplierMutation()
  const deactivateMutation = useDeactivateSupplierMutation()
  const reactivateMutation = useReactivateSupplierMutation()

  async function handleCreate(values: SaveSupplierFormValues): Promise<boolean> {
    try {
      await createMutation.mutateAsync(toSaveRequest(values))
      toast.success('Đã thêm nhà cung cấp mới.')
      setIsCreateOpen(false)
      return true
    } catch (error) {
      logger.error(error)
      toast.error(getApiErrorMessage(error, 'Không thể thêm nhà cung cấp. Vui lòng thử lại.'))
      return false
    }
  }

  async function handleUpdate(values: SaveSupplierFormValues): Promise<boolean> {
    if (!supplierToEdit) return false

    try {
      await updateMutation.mutateAsync({
        supplierId: supplierToEdit.id,
        request: toSaveRequest(values),
      })
      toast.success('Đã cập nhật nhà cung cấp.')
      setSupplierToEdit(null)
      return true
    } catch (error) {
      logger.error(error)
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật nhà cung cấp. Vui lòng thử lại.'))
      return false
    }
  }

  async function handleDeactivate() {
    if (!supplierToDeactivate) return

    try {
      await deactivateMutation.mutateAsync(supplierToDeactivate.id)
      toast.success(`Đã ngừng hợp tác với ${supplierToDeactivate.supplierName}.`)
      setSupplierToDeactivate(null)
      setDeactivateError(null)
    } catch (error) {
      logger.error(error)
      setDeactivateError(getApiErrorMessage(error, 'Không thể ngừng hợp tác. Vui lòng thử lại.'))
    }
  }

  async function handleReactivate() {
    if (!supplierToReactivate) return

    try {
      await reactivateMutation.mutateAsync(supplierToReactivate.id)
      toast.success(`Đã khôi phục hợp tác với ${supplierToReactivate.supplierName}.`)
      setSupplierToReactivate(null)
      setReactivateError(null)
    } catch (error) {
      logger.error(error)
      setReactivateError(
        getApiErrorMessage(error, 'Không thể khôi phục hợp tác. Vui lòng thử lại.')
      )
    }
  }

  return (
    <>
      <SupplierDirectory
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        status={status}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        canCreate={permissions.includes('suppliers:create')}
        canUpdate={permissions.includes('suppliers:update')}
        canDeactivate={permissions.includes('suppliers:deactivate')}
        canReactivate={permissions.includes('suppliers:reactivate')}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
        }}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onCreate={() => setIsCreateOpen(true)}
        onEdit={setSupplierToEdit}
        onDeactivate={(supplier) => {
          setDeactivateError(null)
          setSupplierToDeactivate(supplier)
        }}
        onReactivate={(supplier) => {
          setReactivateError(null)
          setSupplierToReactivate(supplier)
        }}
        onRetry={() => void query.refetch()}
      />

      <SupplierCreateDialog
        open={isCreateOpen}
        isPending={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      <SupplierEditDialog
        open={supplierToEdit !== null}
        supplier={supplierToEdit}
        isPending={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSupplierToEdit(null)
        }}
        onSubmit={handleUpdate}
      />

      <SupplierDeactivateDialog
        supplierName={supplierToDeactivate?.supplierName ?? ''}
        open={supplierToDeactivate !== null}
        isPending={deactivateMutation.isPending}
        errorMessage={deactivateError}
        onOpenChange={(open) => {
          if (!open) {
            setSupplierToDeactivate(null)
            setDeactivateError(null)
          }
        }}
        onConfirm={() => void handleDeactivate()}
      />

      <SupplierReactivateDialog
        supplierName={supplierToReactivate?.supplierName ?? ''}
        open={supplierToReactivate !== null}
        isPending={reactivateMutation.isPending}
        errorMessage={reactivateError}
        onOpenChange={(open) => {
          if (!open) {
            setSupplierToReactivate(null)
            setReactivateError(null)
          }
        }}
        onConfirm={() => void handleReactivate()}
      />
    </>
  )
}
