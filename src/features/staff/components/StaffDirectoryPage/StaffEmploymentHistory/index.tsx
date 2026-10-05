'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { History, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import {
  useStaffEmploymentHistoryQuery,
  useUpdateStaffEmploymentPeriodMutation,
} from '../../../hooks/use-staff'
import {
  staffEmploymentPeriodSchema,
  type StaffEmploymentPeriodFormValues,
} from '../../../schemas/staff-employment-period.schema'
import type { StaffEmploymentPeriod } from '../../../types/staff.types'
import { EmploymentPeriodDialog } from './EmploymentPeriodDialog'
import { EmploymentPeriodList } from './EmploymentPeriodList'

interface StaffEmploymentHistoryProps {
  readonly userId: string
  readonly enabled: boolean
  readonly canEdit: boolean
}

export function StaffEmploymentHistory({ userId, enabled, canEdit }: StaffEmploymentHistoryProps) {
  const [periodToEdit, setPeriodToEdit] = useState<StaffEmploymentPeriod | null>(null)
  const historyQuery = useStaffEmploymentHistoryQuery(userId, enabled)
  const updateMutation = useUpdateStaffEmploymentPeriodMutation()
  const form = useForm<StaffEmploymentPeriodFormValues>({
    resolver: zodResolver(staffEmploymentPeriodSchema),
    defaultValues: { startDate: '', endDate: '' },
  })

  const periods = historyQuery.data?.periods ?? []

  function openEditor(period: StaffEmploymentPeriod) {
    form.reset({ startDate: period.startDate, endDate: period.endDate ?? '' })
    setPeriodToEdit(period)
  }

  async function handleSubmit(values: StaffEmploymentPeriodFormValues) {
    if (!periodToEdit) return
    try {
      await updateMutation.mutateAsync({
        userId,
        periodId: periodToEdit.id,
        request: { startDate: values.startDate, endDate: values.endDate || null },
      })
      toast.success('Đã cập nhật giai đoạn làm việc.')
      setPeriodToEdit(null)
    } catch (error) {
      logger.error(error)
      toast.error(
        getApiErrorMessage(error, 'Không thể cập nhật giai đoạn làm việc. Vui lòng thử lại.')
      )
    }
  }

  return (
    <section className="border-t" aria-labelledby="staff-employment-history-title">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="text-muted-foreground size-4" aria-hidden="true" />
          <h3 id="staff-employment-history-title" className="text-sm font-semibold">
            Lịch sử làm việc
          </h3>
        </div>
        <Badge variant="outline">{periods.length}</Badge>
      </div>

      {historyQuery.isLoading && (
        <div className="space-y-2 border-t p-4" aria-label="Đang tải lịch sử làm việc">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {historyQuery.isError && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
          <p className="text-destructive text-xs">Không thể tải lịch sử làm việc.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void historyQuery.refetch()}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      )}

      {historyQuery.isSuccess && periods.length === 0 && (
        <p className="text-muted-foreground border-t px-4 py-5 text-sm">
          Chưa có lịch sử làm việc được ghi nhận.
        </p>
      )}

      {historyQuery.isSuccess && periods.length > 0 && (
        <EmploymentPeriodList periods={periods} canEdit={canEdit} onEdit={openEditor} />
      )}

      {periodToEdit && (
        <EmploymentPeriodDialog
          period={periodToEdit}
          form={form}
          isPending={updateMutation.isPending}
          onOpenChange={(open) => !open && setPeriodToEdit(null)}
          onSubmit={(values) => void handleSubmit(values)}
        />
      )}
    </section>
  )
}
