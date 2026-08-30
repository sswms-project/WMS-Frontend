'use client'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { APP_ROUTES } from '@/routes/app-routes'
import { CycleCountDetailView } from '../components/CycleCountDetailView'
import {
  useCreateStockAdjustmentMutation,
  useCycleCountAllowedActionsQuery,
  useCycleCountQuery,
  useFinalizeCycleCountMutation,
  useRecordCycleCountItemMutation,
  useRequestRecountMutation,
  useSubmitCycleCountMutation,
} from '../hooks/use-cycle-count'
import {
  recountSchema,
  stockAdjustmentSchema,
  type RecountFormValues,
  type StockAdjustmentFormValues,
} from '../schemas/cycle-count.schema'

export default function CycleCountDetailPage({ cycleCountId }: { readonly cycleCountId: string }) {
  const router = useRouter()
  const detail = useCycleCountQuery(cycleCountId)
  const actions = useCycleCountAllowedActionsQuery(cycleCountId)
  const me = useMeQuery()
  const record = useRecordCycleCountItemMutation()
  const submit = useSubmitCycleCountMutation()
  const recount = useRequestRecountMutation()
  const finalize = useFinalizeCycleCountMutation()
  const adjustment = useCreateStockAdjustmentMutation()
  const recountForm = useForm<RecountFormValues>({
    resolver: zodResolver(recountSchema),
    defaultValues: { itemIds: [], reason: '' },
  })
  const adjustmentForm = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { cycleCountItemId: '', reason: '' },
  })
  const pending =
    record.isPending ||
    submit.isPending ||
    recount.isPending ||
    finalize.isPending ||
    adjustment.isPending
  async function perform(action: () => Promise<unknown>, message: string): Promise<boolean> {
    try {
      await action()
      toast.success(message)
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.')
      return false
    }
  }
  if (detail.isLoading || actions.isLoading) return <OperationalLoadingState rows={8} />
  if (detail.isError || actions.isError || !detail.data)
    return (
      <OperationalErrorState
        title="Không thể tải phiếu kiểm kê"
        onRetry={() => void Promise.all([detail.refetch(), actions.refetch()])}
      />
    )
  return (
    <CycleCountDetailView
      detail={detail.data}
      allowedActions={actions.data?.allowedActions ?? []}
      isPending={pending}
      canCreateAdjustment={me.data?.permissions.includes('stock-adjustments:create') ?? false}
      recountForm={recountForm}
      adjustmentForm={adjustmentForm}
      onRecord={async (itemId, quantity) => {
        await perform(
          () => record.mutateAsync({ cycleCountId, itemId, countedQuantity: quantity }),
          'Đã lưu số đếm.'
        )
      }}
      onSubmit={async () => {
        await perform(() => submit.mutateAsync(cycleCountId), 'Đã gửi kết quả kiểm kê.')
      }}
      onRecount={(itemIds, reason) =>
        perform(
          () => recount.mutateAsync({ cycleCountId, request: { itemIds, reason } }),
          'Đã yêu cầu kiểm đếm lại.'
        )
      }
      onFinalize={async () => {
        await perform(() => finalize.mutateAsync(cycleCountId), 'Đã hoàn tất phiếu kiểm kê.')
      }}
      onCreateAdjustment={async (itemId, reason) => {
        try {
          const response = await adjustment.mutateAsync({ cycleCountItemId: itemId, reason })
          toast.success('Đã tạo đề nghị điều chỉnh.')
          router.push(APP_ROUTES.stockAdjustmentDetail(response.data))
          return true
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể tạo đề nghị điều chỉnh.')
          return false
        }
      }}
    />
  )
}
