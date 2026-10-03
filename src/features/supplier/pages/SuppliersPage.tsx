'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { logger } from '@/lib/logger'
import {
  SupplierCreateDialog,
  SupplierDeactivateDialog,
  SupplierDirectory,
  SupplierEditDialog,
  SupplierImportDialog,
  SupplierReactivateDialog,
  type SupplierImportPreviewOutcome,
} from '../components/SuppliersPage'
import {
  useCreateSupplierMutation,
  useDeactivateSupplierMutation,
  useImportSuppliersMutation,
  useNextSupplierCodeQuery,
  usePreviewSupplierImportMutation,
  useReactivateSupplierMutation,
  useSupplierImportTemplateMutation,
  useSuppliersQuery,
  useUpdateSupplierMutation,
} from '../hooks/use-suppliers'
import type { SaveSupplierFormValues } from '../schemas/supplier.schema'
import type {
  SaveSupplierRequest,
  Supplier,
  SupplierImportPreviewRow,
  SupplierStatus,
} from '../types/supplier.types'
import { getApiErrorMessage } from '../utils/supplier-error'
import { toImportItem } from '../utils/supplier-import'

function toSaveRequest(values: SaveSupplierFormValues): SaveSupplierRequest {
  return {
    supplierCode: values.supplierCode,
    supplierName: values.supplierName,
    taxCode: values.taxCode || null,
    phone: values.phone,
    email: values.email || null,
    address: values.address || null,
    contactSalutation: values.contactSalutation || null,
    contactName: values.contactName || null,
    contactEmail: values.contactEmail || null,
    contactMobile: values.contactMobile || null,
    contactChannel: values.contactChannel || null,
    contactChannelName: values.contactChannelName || null,
  }
}

export default function SuppliersPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<SupplierStatus | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
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
    pageSize,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(status ? { status } : {}),
  })
  const nextCodeQuery = useNextSupplierCodeQuery(isCreateOpen)

  const createMutation = useCreateSupplierMutation()
  const importMutation = useImportSuppliersMutation()
  const previewImportMutation = usePreviewSupplierImportMutation()
  const importTemplateMutation = useSupplierImportTemplateMutation()
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

  async function handlePreviewImport(file: File): Promise<SupplierImportPreviewOutcome> {
    try {
      const response = await previewImportMutation.mutateAsync(file)
      return { isSucceeded: true, rows: response.data.rows }
    } catch (error) {
      logger.error(error)
      const message = getApiErrorMessage(error, 'Không thể đọc tệp nhập. Vui lòng thử lại.')
      toast.error(message)
      return { isSucceeded: false, message }
    }
  }

  async function handleDownloadImportTemplate() {
    try {
      await importTemplateMutation.mutateAsync()
    } catch (error) {
      logger.error(error)
      toast.error(getApiErrorMessage(error, 'Không thể tải tệp mẫu. Vui lòng thử lại.'))
    }
  }

  async function handleImport(rows: readonly SupplierImportPreviewRow[]): Promise<boolean> {
    try {
      await importMutation.mutateAsync({ items: rows.map(toImportItem) })
      toast.success(`Đã nhập ${rows.length} nhà cung cấp.`)
      setIsImportOpen(false)
      setImportError(null)
      return true
    } catch (error) {
      logger.error(error)
      const message = getApiErrorMessage(error, 'Không thể nhập nhà cung cấp. Vui lòng thử lại.')
      setImportError(message)
      toast.error(message)
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
        pageSize={pageSize}
        searchText={searchText}
        status={status}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        canCreate={permissions.includes(P.SUPPLIERS_CREATE)}
        canUpdate={permissions.includes(P.SUPPLIERS_UPDATE)}
        canDeactivate={permissions.includes(P.SUPPLIERS_DEACTIVATE)}
        canReactivate={permissions.includes(P.SUPPLIERS_REACTIVATE)}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
        }}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value)
          setPage(1)
        }}
        onCreate={() => setIsCreateOpen(true)}
        onImport={() => {
          setImportError(null)
          setIsImportOpen(true)
        }}
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
        suggestedCode={nextCodeQuery.data?.data}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      <SupplierImportDialog
        open={isImportOpen}
        isPreviewing={previewImportMutation.isPending}
        isImporting={importMutation.isPending}
        isDownloadingTemplate={importTemplateMutation.isPending}
        errorMessage={importError}
        onOpenChange={(open) => {
          setIsImportOpen(open)
          if (!open) setImportError(null)
        }}
        onDownloadTemplate={() => void handleDownloadImportTemplate()}
        onPreview={handlePreviewImport}
        onImport={handleImport}
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
