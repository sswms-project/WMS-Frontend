'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { StatusChangeDialog } from '@/components/operations/StatusChangeDialog'
import { P } from '@/config/permissionCodes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import {
  StockRecipientDirectory,
  StockRecipientFormDialog,
} from '../components/StockRecipientsPage'
import {
  useCreateStockRecipientMutation,
  useChangeStockRecipientStatusMutation,
  useNextStockRecipientCodeQuery,
  useStockRecipientsQuery,
  useUpdateStockRecipientMutation,
} from '../hooks/use-stock-recipients'
import {
  stockRecipientSchema,
  type StockRecipientFormValues,
} from '../schemas/stock-recipient.schema'
import type { StockRecipient } from '../types/stock-recipient.types'

export default function StockRecipientPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive' | ''>('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
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
  const form = useForm<StockRecipientFormValues>({
    resolver: zodResolver(stockRecipientSchema),
    defaultValues: {
      recipientCode: '',
      recipientName: '',
      taxCode: '',
      phone: '',
      email: '',
      address: '',
    },
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

  async function handleSave(values: StockRecipientFormValues) {
    const request = {
      ...values,
      taxCode: values.taxCode || null,
      email: values.email || null,
    }
    try {
      if (editingRecipient) {
        await updateMutation.mutateAsync({ stockRecipientId: editingRecipient.id, request })
        toast.success('Đã cập nhật khách hàng.')
      } else {
        await createMutation.mutateAsync(request)
        toast.success('Đã thêm khách hàng.')
      }
      setIsCreateOpen(false)
      setEditingRecipient(null)
      form.reset()
    } catch {
      toast.error(
        editingRecipient
          ? 'Không thể cập nhật khách hàng. Vui lòng thử lại.'
          : 'Không thể thêm khách hàng. Vui lòng thử lại.'
      )
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
        onCreate={() => {
          setEditingRecipient(null)
          form.reset({
            recipientCode: '',
            recipientName: '',
            taxCode: '',
            phone: '',
            email: '',
            address: '',
          })
          setIsCreateOpen(true)
        }}
        onEdit={(stockRecipient) => {
          setIsCreateOpen(false)
          setEditingRecipient(stockRecipient)
          form.reset({
            recipientCode: stockRecipient.recipientCode,
            recipientName: stockRecipient.recipientName,
            taxCode: stockRecipient.taxCode ?? '',
            phone: stockRecipient.phone,
            email: stockRecipient.email ?? '',
            address: stockRecipient.address,
          })
        }}
        onChangeStatus={setStatusTarget}
        onRetry={() => void stockRecipientsQuery.refetch()}
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
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditingRecipient(null)
            form.reset()
          }
        }}
        onSubmit={(values) => void handleSave(values)}
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
