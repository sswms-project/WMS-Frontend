'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import {
  StockRecipientDirectory,
  StockRecipientFormDialog,
} from '../components/StockRecipientsPage'
import {
  useCreateStockRecipientMutation,
  useStockRecipientsQuery,
} from '../hooks/use-stock-recipients'
import {
  stockRecipientSchema,
  type StockRecipientFormValues,
} from '../schemas/stock-recipient.schema'

const PAGE_SIZE = 10

export default function StockRecipientPage() {
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const meQuery = useMeQuery()
  const stockRecipientsQuery = useStockRecipientsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
  })
  const createMutation = useCreateStockRecipientMutation()
  const form = useForm<StockRecipientFormValues>({
    resolver: zodResolver(stockRecipientSchema),
    defaultValues: { recipientName: '', phone: '', email: '', address: '' },
  })

  async function handleCreate(values: StockRecipientFormValues) {
    try {
      await createMutation.mutateAsync({ ...values, email: values.email || null })
      toast.success('Đã thêm đơn vị nhận hàng.')
      setIsCreateOpen(false)
      form.reset()
    } catch {
      toast.error('Không thể thêm đơn vị nhận hàng. Vui lòng thử lại.')
    }
  }

  return (
    <>
      <StockRecipientDirectory
        items={stockRecipientsQuery.data?.items ?? []}
        totalCount={stockRecipientsQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        canCreate={(meQuery.data?.permissions ?? []).includes('stock-recipients:create')}
        isLoading={stockRecipientsQuery.isLoading}
        isFetching={stockRecipientsQuery.isFetching}
        isError={stockRecipientsQuery.isError}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onCreate={() => setIsCreateOpen(true)}
        onRetry={() => void stockRecipientsQuery.refetch()}
      />
      <StockRecipientFormDialog
        open={isCreateOpen}
        title="Thêm đơn vị nhận hàng"
        description="Thông tin này được dùng làm người nhận mặc định cho yêu cầu xuất kho."
        form={form}
        isPending={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => void handleCreate(values)}
      />
    </>
  )
}
