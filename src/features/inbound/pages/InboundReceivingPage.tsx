'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import { InboundPageHeader } from '../components/InboundWorkspace'
import { ReceiveGoodsDialog, ReceivingTaskDirectory } from '../components/ReceivingPage'
import {
  useCreateInboundReceiptMutation,
  useReceivingTasksQuery,
  useSubmitInboundReceiptMutation,
} from '../hooks/use-inbound'
import { inboundReceiptSchema, type InboundReceiptFormValues } from '../schemas/inbound.schema'
import type { ReceivingTask, SaveInboundReceiptRequest } from '../types/inbound.types'

const PAGE_SIZE = 10

export default function InboundReceivingPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [selectedTask, setSelectedTask] = useState<ReceivingTask | null>(null)
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = useReceivingTasksQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
  })
  const createMutation = useCreateInboundReceiptMutation()
  const submitMutation = useSubmitInboundReceiptMutation()
  const form = useForm<InboundReceiptFormValues>({
    resolver: zodResolver(inboundReceiptSchema),
    defaultValues: { purchaseOrderId: '', lines: [] },
  })

  function openReceive(task: ReceivingTask) {
    setSelectedTask(task)
    form.reset({
      purchaseOrderId: task.purchaseOrderId,
      lines: task.lines
        .filter((line) => line.remainingQuantity > 0)
        .map((line) => ({
          poLineId: line.purchaseOrderItemId,
          receivedQty: line.remainingQuantity,
          damagedQty: 0,
          exceptionReason: '',
        })),
    })
  }

  async function save(values: InboundReceiptFormValues, shouldSubmit: boolean) {
    try {
      const request: SaveInboundReceiptRequest = {
        purchaseOrderId: values.purchaseOrderId,
        lines: values.lines.map((line) => ({
          ...line,
          exceptionReason: line.exceptionReason.trim() || null,
        })),
      }
      const response = await createMutation.mutateAsync(request)
      if (shouldSubmit) {
        try {
          await submitMutation.mutateAsync(response.data)
        } catch (error) {
          logger.error(error)
          toast.error(
            'Phiếu nhập đã được lưu nháp nhưng chưa gửi duyệt. Bạn có thể thử lại từ trang chi tiết.'
          )
          setSelectedTask(null)
          form.reset()
          router.push(APP_ROUTES.inboundReceiptDetail(response.data) as Route)
          return
        }
      }
      toast.success(
        shouldSubmit ? 'Đã tạo và gửi phiếu nhập để duyệt.' : 'Đã lưu bản nháp phiếu nhập.'
      )
      setSelectedTask(null)
      form.reset()
    } catch (error) {
      logger.error(error)
      toast.error('Không thể lưu phiếu nhập. Kiểm tra số lượng và thử lại.')
    }
  }

  const isPending = createMutation.isPending || submitMutation.isPending
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <InboundPageHeader
        title="Nhập kho"
        description="Tiếp nhận hàng theo đơn mua đã được phê duyệt."
      />
      <ReceivingTaskDirectory
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
        }}
        onPageChange={setPage}
        onReceive={openReceive}
        onRetry={() => void query.refetch()}
      />
      <ReceiveGoodsDialog
        task={selectedTask}
        form={form}
        isPending={isPending}
        onOpenChange={(open) => {
          if (!open && !isPending) setSelectedTask(null)
        }}
        onSaveDraft={() => void form.handleSubmit((values) => save(values, false))()}
        onSaveAndSubmit={() => void form.handleSubmit((values) => save(values, true))()}
      />
    </div>
  )
}
