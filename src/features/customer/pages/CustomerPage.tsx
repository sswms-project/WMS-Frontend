'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { CustomerDirectory, CustomerFormDialog } from '../components/CustomersPage'
import { useCreateCustomerMutation, useCustomersQuery } from '../hooks/use-customers'
import { customerSchema, type CustomerFormValues } from '../schemas/customer.schema'

const PAGE_SIZE = 10

export default function CustomerPage() {
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const meQuery = useMeQuery()
  const customersQuery = useCustomersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
  })
  const createMutation = useCreateCustomerMutation()
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { customerName: '', phone: '', email: '', address: '' },
  })

  async function handleCreate(values: CustomerFormValues) {
    try {
      await createMutation.mutateAsync({ ...values, email: values.email || null })
      toast.success('Đã thêm khách hàng.')
      setIsCreateOpen(false)
      form.reset()
    } catch {
      toast.error('Không thể thêm khách hàng. Vui lòng thử lại.')
    }
  }

  return (
    <>
      <CustomerDirectory
        items={customersQuery.data?.items ?? []}
        totalCount={customersQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        canCreate={(meQuery.data?.permissions ?? []).includes('customers:create')}
        isLoading={customersQuery.isLoading}
        isFetching={customersQuery.isFetching}
        isError={customersQuery.isError}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onCreate={() => setIsCreateOpen(true)}
        onRetry={() => void customersQuery.refetch()}
      />
      <CustomerFormDialog
        open={isCreateOpen}
        title="Thêm khách hàng"
        description="Thông tin này được dùng làm người nhận mặc định cho đơn xuất kho."
        form={form}
        isPending={createMutation.isPending}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => void handleCreate(values)}
      />
    </>
  )
}
