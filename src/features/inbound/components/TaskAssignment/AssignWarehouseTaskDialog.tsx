'use client'

import { LoaderCircle, RefreshCw, UserCheck, UsersRound } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { AssignWarehouseTaskFormValues } from '../../schemas/inbound.schema'
import type { AssignableWarehouseStaff } from '../../types/inbound.types'

export interface AssignWarehouseTaskTarget {
  readonly kind: 'Receiving' | 'PutAway'
  readonly id: string
  readonly referenceCode: string
  readonly warehouseId: string
  readonly warehouseName: string
  readonly currentAssigneeId: string | null
  readonly currentAssigneeName: string | null
}

interface AssignWarehouseTaskDialogProps {
  readonly target: AssignWarehouseTaskTarget | null
  readonly form: UseFormReturn<AssignWarehouseTaskFormValues>
  readonly staff: readonly AssignableWarehouseStaff[]
  readonly isLoadingStaff: boolean
  readonly isErrorStaff: boolean
  readonly isFetchingStaff: boolean
  readonly onRetryStaff: () => void
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: () => void
}

const TASK_LABELS = {
  Receiving: 'nhận hàng',
  PutAway: 'cất hàng',
} as const

export function AssignWarehouseTaskDialog({
  target,
  form,
  staff,
  isLoadingStaff,
  isErrorStaff,
  isFetchingStaff,
  onRetryStaff,
  isPending,
  onOpenChange,
  onSubmit,
}: AssignWarehouseTaskDialogProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form
  const isReassignment = Boolean(target?.currentAssigneeId)
  const taskLabel = target ? TASK_LABELS[target.kind] : ''

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <DialogContent className="sm:max-w-lg">
        {target && (
          <>
            <DialogHeader>
              <DialogTitle>
                {isReassignment ? `Giao lại việc ${taskLabel}` : `Giao việc ${taskLabel}`}
              </DialogTitle>
              <DialogDescription>
                <span className="font-mono font-medium" translate="no">
                  {target.referenceCode}
                </span>{' '}
                · {target.warehouseName}
                {isReassignment && target.currentAssigneeName
                  ? ` · Đang giao cho ${target.currentAssigneeName}`
                  : ''}
              </DialogDescription>
            </DialogHeader>

            <Field data-invalid={Boolean(errors.staffId)}>
              <FieldLabel>Nhân viên kho nhận việc</FieldLabel>
              <FieldDescription>
                Chỉ hiển thị Nhân viên kho đang hoạt động và được phân công vào kho này. Người ít
                việc đang mở được xếp trước.
              </FieldDescription>
              {isLoadingStaff ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : isErrorStaff ? (
                <div className="flex flex-col items-start gap-2 border p-3 text-sm">
                  <span>Không thể tải danh sách nhân viên của kho.</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isFetchingStaff}
                    onClick={onRetryStaff}
                  >
                    <RefreshCw
                      className={isFetchingStaff ? 'animate-spin' : undefined}
                      aria-hidden="true"
                    />
                    Thử lại
                  </Button>
                </div>
              ) : staff.length === 0 ? (
                <div className="text-muted-foreground flex items-start gap-3 border border-dashed p-3 text-sm">
                  <UsersRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    Kho này chưa có Nhân viên kho đang hoạt động. Hãy phân công nhân viên vào kho
                    tại Danh bạ nhân sự trước khi giao việc.
                  </span>
                </div>
              ) : (
                <Controller
                  control={control}
                  name="staffId"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-label="Nhân viên kho nhận việc"
                      className="max-h-72 gap-1.5 overflow-y-auto"
                    >
                      {staff.map((person) => (
                        <StaffOption
                          key={person.id}
                          person={person}
                          isCurrent={person.id === target.currentAssigneeId}
                          isSelected={field.value === person.id}
                        />
                      ))}
                    </RadioGroup>
                  )}
                />
              )}
              <FieldError>{errors.staffId?.message}</FieldError>
            </Field>

            {isReassignment && (
              <Field data-invalid={Boolean(errors.reason)}>
                <FieldLabel htmlFor="assign-task-reason">Lý do giao lại</FieldLabel>
                <Textarea
                  id="assign-task-reason"
                  rows={3}
                  maxLength={500}
                  placeholder="Ví dụ: nhân viên nghỉ phép, cân bằng khối lượng công việc…"
                  aria-invalid={Boolean(errors.reason)}
                  {...register('reason')}
                />
                <FieldDescription>
                  Lý do được ghi vào nhật ký hoạt động và gửi thông báo cho cả hai nhân viên.
                </FieldDescription>
                <FieldError>{errors.reason?.message}</FieldError>
              </Field>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={isPending || isLoadingStaff || staff.length === 0}
                onClick={onSubmit}
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <UserCheck aria-hidden="true" />
                )}
                {isReassignment ? 'Giao lại' : 'Giao việc'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StaffOption({
  person,
  isCurrent,
  isSelected,
}: {
  readonly person: AssignableWarehouseStaff
  readonly isCurrent: boolean
  readonly isSelected: boolean
}) {
  const inputId = `assign-staff-${person.id}`
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex cursor-pointer items-center gap-3 border p-3 transition-colors',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted',
        isCurrent && 'cursor-not-allowed opacity-60'
      )}
    >
      <RadioGroupItem id={inputId} value={person.id} disabled={isCurrent} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{person.fullName}</span>
        <span className="text-muted-foreground block truncate text-xs">{person.email}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 text-xs">
        {isCurrent ? (
          <Badge variant="secondary">Đang được giao</Badge>
        ) : person.hasTaskInProgress ? (
          <Badge variant="outline">Đang làm việc khác</Badge>
        ) : null}
        <span className="text-muted-foreground tabular-nums">
          {person.openReceivingTasks} nhận · {person.openPutAwayTasks} cất
        </span>
      </span>
    </label>
  )
}
