'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { StatusChangeDialog } from '@/components/operations/StatusChangeDialog'
import { P } from '@/config/permissionCodes'
import { getApiErrorMessage } from '@/lib/api-error'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import {
  StockRecipientDirectory,
  StockRecipientFormDialog,
  StockRecipientImportDialog,
  type StockRecipientImportPreviewOutcome,
} from '../components/StockRecipientsPage'
import {
  useCreateStockRecipientMutation,
  useChangeStockRecipientStatusMutation,
  useImportStockRecipientsMutation,
  useNextStockRecipientCodeQuery,
  usePreviewStockRecipientImportMutation,
  useStockRecipientImportTemplateMutation,
  useStockRecipientsQuery,
  useUpdateStockRecipientMutation,
} from '../hooks/use-stock-recipients'
import {
  emptyStockRecipientFormValues,
  stockRecipientSchema,
  toStockRecipientRequest,
  type StockRecipientFormValues,
} from '../schemas/stock-recipient.schema'
import type { StockRecipient, StockRecipientImportPreviewRow } from '../types/stock-recipient.types'
import { toImportItem } from '../utils/stock-recipient-import'

export default function StockRecipientPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive' | ''>('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [editingRecipient, setEditingRecipient] = useState<StockRecipient | null>(null)
  const [statusTarget, setStatusTarget] = useState<StockRecipient | null>(null)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const meQuery = useMeQuery()
  const stockRecipientsQuery = useStockRecipientsQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
    ...(status ? { status } : {}),
  })
  const createMutation = useCreateStockRecipientMutation()
  const updateMutation = useUpdateStockRecipientMutation()
  const statusMutation = useChangeStockRecipientStatusMutation()
  const importMutation = useImportStockRecipientsMutation()
  const previewImportMutation = usePreviewStockRecipientImportMutation()
  const importTemplateMutation = useStockRecipientImportTemplateMutation()
  const form = useForm<StockRecipientFormValues>({
    resolver: zodResolver(stockRecipientSchema),
    defaultValues: emptyStockRecipientFormValues,
  })
  const nextCodeQuery = useNextStockRecipientCodeQuery(isCreateOpen)
  const isFormOpen = isCreateOpen || Boolean(editingRecipient)

  useEffect(() => {
    if (!isCreateOpen || !nextCodeQuery.data?.data || form.getFieldState('recipientCode').isDirty) {
      return
    }
    if (!form.getValues('recipientCode')) {
      form.setValue('recipientCode', nextCodeQuery.data.data, { shouldDirty: false })
    }
  }, [form, isCreateOpen, nextCodeQuery.data?.data])

  async function handleSave(values: StockRecipientFormValues, keepOpen = false) {
    const request = toStockRecipientRequest(values)
    try {
      if (editingRecipient) {
        await updateMutation.mutateAsync({ stockRecipientId: editingRecipient.id, request })
        toast.success('Đã cập nhật khách hàng.')
      } else {
        await createMutation.mutateAsync(request)
        toast.success('Đã thêm khách hàng.')
      }
      if (keepOpen && !editingRecipient) {
        const nextCode = await nextCodeQuery.refetch()
        form.reset({ ...emptyStockRecipientFormValues, recipientCode: nextCode.data?.data ?? '' })
        return
      }
      setIsCreateOpen(false)
      setEditingRecipient(null)
      form.reset()
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          editingRecipient ? 'Không thể cập nhật khách hàng.' : 'Không thể thêm khách hàng.'
        )
      )
    }
  }

  async function handlePreviewImport(file: File): Promise<StockRecipientImportPreviewOutcome> {
    try {
      const response = await previewImportMutation.mutateAsync(file)
      return { isSucceeded: true, rows: response.data.rows }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể đọc tệp nhập. Vui lòng thử lại.')
      toast.error(message)
      return { isSucceeded: false, message }
    }
  }

  async function handleDownloadImportTemplate() {
    try {
      await importTemplateMutation.mutateAsync()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải tệp mẫu. Vui lòng thử lại.'))
    }
  }

  async function handleImport(rows: readonly StockRecipientImportPreviewRow[]): Promise<boolean> {
    try {
      await importMutation.mutateAsync({ items: rows.map(toImportItem) })
      toast.success(`Đã nhập ${rows.length} khách hàng.`)
      setIsImportOpen(false)
      setImportError(null)
      return true
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể nhập khách hàng. Vui lòng thử lại.')
      setImportError(message)
      toast.error(message)
      return false
    }
  }

  async function handleStatusChange() {
    if (!statusTarget) return
    const status = statusTarget.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await statusMutation.mutateAsync({ stockRecipientId: statusTarget.id, status })
      toast.success(
        status === 'Active'
          ? 'Đã tiếp tục hợp tác với khách hàng.'
          : 'Đã ngừng hợp tác với khách hàng.'
      )
      setStatusTarget(null)
    } catch {
      toast.error('Không thể thay đổi trạng thái khách hàng. Vui lòng thử lại.')
    }
  }

  return (
    <>
      <StockRecipientDirectory
        items={stockRecipientsQuery.data?.items ?? []}
        totalCount={stockRecipientsQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={pageSize}
        searchText={searchText}
        status={status}
        canCreate={(meQuery.data?.permissions ?? []).includes(P.STOCK_RECIPIENTS_CREATE)}
        canUpdate={(meQuery.data?.permissions ?? []).includes(P.STOCK_RECIPIENTS_UPDATE)}
        canManageStatus={(meQuery.data?.permissions ?? []).includes(
          P.STOCK_RECIPIENTS_MANAGE_STATUS
        )}
        isLoading={stockRecipientsQuery.isLoading}
        isFetching={stockRecipientsQuery.isFetching}
        isError={stockRecipientsQuery.isError}
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
        onImport={() => {
          setImportError(null)
          setIsImportOpen(true)
        }}
        onCreate={() => {
          setEditingRecipient(null)
          form.reset(emptyStockRecipientFormValues)
          setIsCreateOpen(true)
        }}
        onEdit={(stockRecipient) => {
          setIsCreateOpen(false)
          setEditingRecipient(stockRecipient)
          form.reset({
            recipientCode: stockRecipient.recipientCode,
            recipientName: stockRecipient.recipientName,
            recipientType: stockRecipient.recipientType,
            taxCode: stockRecipient.taxCode ?? '',
            phone: stockRecipient.phone,
            email: stockRecipient.email ?? '',
            address: stockRecipient.address,
            shippingAddress: stockRecipient.shippingAddress ?? '',
            contactSalutation: stockRecipient.contactSalutation ?? '',
            contactName: stockRecipient.contactName ?? '',
            contactMobile: stockRecipient.contactMobile ?? '',
            contactChannel: stockRecipient.contactChannel ?? '',
            contactChannelName: stockRecipient.contactChannelName ?? '',
          })
        }}
        onChangeStatus={setStatusTarget}
        onRetry={() => void stockRecipientsQuery.refetch()}
      />
      <StockRecipientImportDialog
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
      <StockRecipientFormDialog
        open={isFormOpen}
        title={editingRecipient ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
        description={
          editingRecipient
            ? 'Cập nhật thông tin liên hệ của khách hàng.'
            : 'Thông tin khách hàng được dùng trong các yêu cầu xuất kho.'
        }
        form={form}
        isPending={createMutation.isPending || updateMutation.isPending}
        isCreate={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditingRecipient(null)
            form.reset()
          }
        }}
        onSubmit={(values) => void handleSave(values)}
        onSubmitAndAdd={(values) => void handleSave(values, true)}
      />
      <StatusChangeDialog
        open={Boolean(statusTarget)}
        subject={`khách hàng “${statusTarget?.recipientName ?? ''}”`}
        nextStatus={statusTarget?.status === 'Active' ? 'Inactive' : 'Active'}
        inactiveActionLabel="Ngừng hợp tác"
        activeActionLabel="Tiếp tục hợp tác"
        isPending={statusMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null)
        }}
        onConfirm={() => void handleStatusChange()}
      />
    </>
  )
}
