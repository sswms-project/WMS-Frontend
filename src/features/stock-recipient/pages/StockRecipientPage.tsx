'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import {
  StockRecipientDirectory,
  StockRecipientFormDialog,
} from '../components/StockRecipientsPage'
import {
  useCreateStockRecipientMutation,
  useNextStockRecipientCodeQuery,
  useStockRecipientsQuery,
} from '../hooks/use-stock-recipients'
import {
  stockRecipientSchema,
  type StockRecipientFormValues,
} from '../schemas/stock-recipient.schema'

export default function StockRecipientPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive' | ''>('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const meQuery = useMeQuery()
  const stockRecipientsQuery = useStockRecipientsQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
    ...(status ? { status } : {}),
  })
  const createMutation = useCreateStockRecipientMutation()
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

  useEffect(() => {
    if (!isCreateOpen || !nextCodeQuery.data?.data || form.getFieldState('recipientCode').isDirty) {
      return
    }
    if (!form.getValues('recipientCode')) {
      form.setValue('recipientCode', nextCodeQuery.data.data, { shouldDirty: false })
    }
  }, [form, isCreateOpen, nextCodeQuery.data?.data])

  async function handleCreate(values: StockRecipientFormValues) {
    try {
      await createMutation.mutateAsync({
        ...values,
        taxCode: values.taxCode || null,
        email: values.email || null,
      })
      toast.success('Đã thêm khách hàng.')
      setIsCreateOpen(false)
      form.reset()
    } catch {
      toast.error('Không thể thêm khách hàng. Vui lòng thử lại.')
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
        onRetry={() => void stockRecipientsQuery.refetch()}
      />
      <StockRecipientFormDialog
        open={isCreateOpen}
        title="Thêm khách hàng"
        description="Thông tin khách hàng được dùng trong các yêu cầu xuất kho."
        form={form}
        isPending={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => void handleCreate(values)}
      />
    </>
  )
}
