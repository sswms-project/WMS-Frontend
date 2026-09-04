'use client'

import { LoaderCircle, MailPlus, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { USER_ROLES } from '@/config/roles'
import type { InviteWithWarehouseFormValues } from '../../schemas/invite-with-warehouse.schema'
import type { WarehouseSummaryResponse } from '../../types/manager-assignment.types'
import { WarehousePicker } from './WarehousePicker'
import { StaffDirectoryPagination } from './StaffDirectoryPagination'

interface InviteStaffDialogProps {
  readonly open: boolean
  readonly canInviteManagers: boolean
  readonly form: UseFormReturn<InviteWithWarehouseFormValues>
  readonly warehouses: readonly WarehouseSummaryResponse[]
  readonly warehousePage: number
  readonly warehousePageSize: number
  readonly warehouseTotalCount: number
  readonly onWarehousePage: (page: number) => void
  readonly onWarehouseChange: (id: string) => void
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isPending: boolean
  readonly errorMessage?: string
  readonly onRefresh: () => void
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: InviteWithWarehouseFormValues) => void
}

const roleOptions = [
  { value: USER_ROLES.WarehouseManager, label: 'Quản lý kho', icon: ShieldCheck },
  { value: USER_ROLES.WarehouseStaff, label: 'Nhân viên kho', icon: UserRound },
] as const

export function InviteStaffDialog({
  open,
  canInviteManagers,
  form,
  warehouses,
  warehousePage,
  warehousePageSize,
  warehouseTotalCount,
  onWarehousePage,
  onWarehouseChange,
  isLoading,
  isError,
  isPending,
  errorMessage,
  onRefresh,
  onOpenChange,
  onSubmit,
}: InviteStaffDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form
  const unavailable = isLoading || isError || warehouses.length === 0

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="border-b pr-8 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MailPlus className="text-primary size-4" aria-hidden="true" />
            Mời nhân sự
          </DialogTitle>
          <DialogDescription>Lời mời có hiệu lực trong 7 ngày.</DialogDescription>
        </DialogHeader>
        <form id="invite-staff-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Không thể gửi lời mời</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="invitation-email">Email</FieldLabel>
            <Input
              id="invitation-email"
              type="email"
              autoComplete="email"
              autoFocus
              maxLength={320}
              disabled={isPending}
              aria-invalid={Boolean(errors.email)}
              placeholder="ten@doanhnghiep.vn"
              {...register('email')}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>
          {canInviteManagers ? (
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel id="invitation-role-label">Vai trò</FieldLabel>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                    aria-labelledby="invitation-role-label"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {roleOptions.map(({ value, label, icon: Icon }, index) => (
                      <label
                        key={value}
                        htmlFor={`invitation-role-${index}`}
                        className="has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex min-h-12 cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors duration-150 motion-reduce:transition-none"
                      >
                        <RadioGroupItem id={`invitation-role-${index}`} value={value} />
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FieldError>{errors.role?.message}</FieldError>
                </Field>
              )}
            />
          ) : (
            <p className="text-sm font-medium">Nhân viên kho</p>
          )}
          <Controller
            control={control}
            name="warehouseId"
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.warehouseId)}>
                <FieldLabel htmlFor="invitation-warehouse">
                  Kho làm việc ban đầu <span aria-hidden="true">*</span>
                </FieldLabel>
                <WarehousePicker
                  id="invitation-warehouse"
                  warehouses={warehouses}
                  value={field.value}
                  invalid={Boolean(errors.warehouseId)}
                  disabled={unavailable || isPending}
                  placeholder={
                    isLoading
                      ? 'Đang tải danh sách kho'
                      : isError
                        ? 'Không thể tải danh sách kho'
                        : warehouses.length === 0
                          ? 'Chưa có kho hoạt động'
                          : 'Chọn kho'
                  }
                  onValueChange={onWarehouseChange}
                />
                {warehouseTotalCount > warehousePageSize && (
                  <StaffDirectoryPagination
                    page={warehousePage}
                    pageSize={warehousePageSize}
                    totalCount={warehouseTotalCount}
                    disabled={isLoading || isPending}
                    onPageChange={onWarehousePage}
                  />
                )}
                {isError ? (
                  <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Thử lại
                  </Button>
                ) : (
                  <FieldDescription>
                    {warehouses.length === 0 && !isLoading
                      ? 'Cần có kho hoạt động trước khi gửi lời mời.'
                      : 'Kho được gán khi nhận lời mời. Có thể phân công thêm kho sau đó.'}
                  </FieldDescription>
                )}
                <FieldError>{errors.warehouseId?.message}</FieldError>
              </Field>
            )}
          />
        </form>
        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" form="invite-staff-form" disabled={isPending || unavailable}>
            {isPending ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <MailPlus className="size-4" aria-hidden="true" />
            )}
            Gửi lời mời
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
