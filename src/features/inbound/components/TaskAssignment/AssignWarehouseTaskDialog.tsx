'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, RefreshCw, UserCheck, UsersRound } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { useAssignableStaffQuery } from '../../hooks/use-inbound'
import {
  createAssignWarehouseTaskSchema,
  type AssignWarehouseTaskFormValues,
} from '../../schemas/inbound.schema'
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
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: { staffId: string; reason: string }) => void
}

const TASK_LABELS = {
  Receiving: 'nhận hàng',
  PutAway: 'cất hàng',
} as const

export function AssignWarehouseTaskDialog({
  target,
  isPending,
  onOpenChange,
  onSubmit,
}: AssignWarehouseTaskDialogProps) {
  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <DialogContent className="sm:max-w-lg">
        {target && (
          <AssignWarehouseTaskForm
            key={`${target.kind}:${target.id}`}
            target={target}
            isPending={isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function AssignWarehouseTaskForm({
  target,
  isPending,
  onCancel,
  onSubmit,
}: {
  readonly target: AssignWarehouseTaskTarget
  readonly isPending: boolean
  readonly onCancel: () => void
  readonly onSubmit: (values: { staffId: string; reason: string }) => void
}) {
  const staffQuery = useAssignableStaffQuery(target.warehouseId)
  const isReassignment = Boolean(target.currentAssigneeId)
  const schema = useMemo(
    () => createAssignWarehouseTaskSchema(target.currentAssigneeId),
    [target.currentAssigneeId]
  )
  const form = useForm<AssignWarehouseTaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { staffId: '', reason: '' },
  })
  const taskLabel = TASK_LABELS[target.kind]
  const staff = staffQuery.data ?? []

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) =>
        onSubmit({ staffId: values.staffId, reason: values.reason.trim() })
      )}
    >
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

      <Field data-invalid={Boolean(form.formState.errors.staffId)}>
        <FieldLabel>Nhân viên kho nhận việc</FieldLabel>
        <FieldDescription>
          Chỉ hiển thị Nhân viên kho đang hoạt động và được phân công vào kho này. Người ít việc
          đang mở được xếp trước.
        </FieldDescription>
        {staffQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : staffQuery.isError ? (
          <div className="flex flex-col items-start gap-2 border p-3 text-sm">
            <span>Không thể tải danh sách nhân viên của kho.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={staffQuery.isFetching}
              onClick={() => void staffQuery.refetch()}
            >
              <RefreshCw
                className={staffQuery.isFetching ? 'animate-spin' : undefined}
                aria-hidden="true"
              />
              Thử lại
            </Button>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-muted-foreground flex items-start gap-3 border border-dashed p-3 text-sm">
            <UsersRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Kho này chưa có Nhân viên kho đang hoạt động. Hãy phân công nhân viên vào kho tại Danh
              bạ nhân sự trước khi giao việc.
            </span>
          </div>
        ) : (
          <Controller
            control={form.control}
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
        <FieldError>{form.formState.errors.staffId?.message}</FieldError>
      </Field>

      {isReassignment && (
        <Field data-invalid={Boolean(form.formState.errors.reason)}>
          <FieldLabel htmlFor="assign-task-reason">Lý do giao lại</FieldLabel>
          <Textarea
            id="assign-task-reason"
            rows={3}
            maxLength={500}
            placeholder="Ví dụ: nhân viên nghỉ phép, cân bằng khối lượng công việc…"
            aria-invalid={Boolean(form.formState.errors.reason)}
            {...form.register('reason')}
          />
          <FieldDescription>
            Lý do được ghi vào nhật ký hoạt động và gửi thông báo cho cả hai nhân viên.
          </FieldDescription>
          <FieldError>{form.formState.errors.reason?.message}</FieldError>
        </Field>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isPending || staffQuery.isLoading || staff.length === 0}>
          {isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <UserCheck aria-hidden="true" />
          )}
          {isReassignment ? 'Giao lại' : 'Giao việc'}
        </Button>
      </DialogFooter>
    </form>
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
