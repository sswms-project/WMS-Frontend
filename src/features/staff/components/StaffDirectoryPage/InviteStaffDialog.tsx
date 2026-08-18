'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, MailPlus, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
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
import { useSendInvitationMutation } from '../../hooks/use-invitations'
import { useAssignmentWarehousesQuery } from '../../hooks/use-manager-assignment'
import {
  inviteWithWarehouseSchema,
  type InviteWithWarehouseFormValues,
} from '../../schemas/invite-with-warehouse.schema'
import type { InvitableRole } from '../../types/invitation.types'
import type { WarehouseAssignmentQuery } from '../../types/manager-assignment.types'
import { getActiveWarehouses } from '../../utils/active-warehouses'
import { WarehousePicker } from './WarehousePicker'

interface InviteStaffDialogProps {
  readonly open: boolean
  readonly canInviteManagers: boolean
  readonly onOpenChange: (open: boolean) => void
}

const roleOptions = [
  {
    id: 'warehouse-manager',
    value: USER_ROLES.WarehouseManager,
    label: 'Quản lý kho',
    description: 'Điều phối vận hành và nhân sự kho.',
    icon: ShieldCheck,
  },
  {
    id: 'warehouse-staff',
    value: USER_ROLES.WarehouseStaff,
    label: 'Nhân viên kho',
    description: 'Thực hiện nghiệp vụ tại kho được phân công.',
    icon: UserRound,
  },
] as const

const invitationWarehouseQuery: WarehouseAssignmentQuery = {
  top: 1000,
  skip: 0,
  needTotalCount: true,
  status: 'Active',
}

function isInvitableRole(value: string): value is InvitableRole {
  return value === USER_ROLES.WarehouseManager || value === USER_ROLES.WarehouseStaff
}

export function InviteStaffDialog({
  open,
  canInviteManagers,
  onOpenChange,
}: InviteStaffDialogProps) {
  const invitationMutation = useSendInvitationMutation()
  const defaultRole = canInviteManagers ? USER_ROLES.WarehouseManager : USER_ROLES.WarehouseStaff
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InviteWithWarehouseFormValues>({
    resolver: zodResolver(inviteWithWarehouseSchema),
    defaultValues: { email: '', role: defaultRole, warehouseId: undefined },
  })
  const selectedRole = useWatch({ control, name: 'role' })
  const warehousesQuery = useAssignmentWarehousesQuery(
    invitationWarehouseQuery,
    open && selectedRole === USER_ROLES.WarehouseStaff
  )
  const activeWarehouses = getActiveWarehouses(warehousesQuery.data?.items ?? [])

  function handleOpenChange(nextOpen: boolean) {
    if (invitationMutation.isPending) return
    if (!nextOpen) {
      reset({ email: '', role: defaultRole, warehouseId: undefined })
      invitationMutation.reset()
    }
    onOpenChange(nextOpen)
  }

  async function submit(values: InviteWithWarehouseFormValues) {
    try {
      await invitationMutation.mutateAsync(values)
      toast.success(`Đã gửi lời mời đến ${values.email}.`)
      reset({ email: '', role: defaultRole, warehouseId: undefined })
      onOpenChange(false)
    } catch {
      // The mutation error is rendered inline so the user can correct the form in place.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="border-b pr-8 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MailPlus className="text-primary size-4" aria-hidden="true" />
            Mời nhân sự
          </DialogTitle>
          <DialogDescription>
            Gửi link tạo tài khoản qua email. Lời mời có hiệu lực trong 7 ngày.
          </DialogDescription>
        </DialogHeader>

        <form id="invite-staff-form" className="space-y-5" onSubmit={handleSubmit(submit)}>
          {invitationMutation.error && (
            <Alert variant="destructive">
              <MailPlus className="size-4" aria-hidden="true" />
              <AlertTitle>Không thể gửi lời mời</AlertTitle>
              <AlertDescription>{invitationMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="invitation-email">Email</FieldLabel>
            <Input
              id="invitation-email"
              type="email"
              autoComplete="email"
              autoFocus
              maxLength={255}
              aria-invalid={Boolean(errors.email)}
              placeholder="ten@doanhnghiep.vn"
              {...register('email')}
            />
            <FieldDescription>Người nhận dùng email này để kích hoạt tài khoản.</FieldDescription>
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          {canInviteManagers ? (
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.role)}>
                  <FieldLabel id="invitation-role-label">Vai trò</FieldLabel>
                  <RadioGroup
                    value={field.value}
                    aria-labelledby="invitation-role-label"
                    className="grid gap-2 sm:grid-cols-2"
                    onValueChange={(value) => {
                      if (!isInvitableRole(value)) return
                      field.onChange(value)
                      if (value === USER_ROLES.WarehouseManager) {
                        setValue('warehouseId', undefined, { shouldValidate: true })
                      }
                    }}
                  >
                    {roleOptions.map(({ id, value, label, description, icon: Icon }) => (
                      <label
                        key={value}
                        htmlFor={`invitation-role-${id}`}
                        className="has-data-checked:border-primary has-data-checked:bg-primary/5 flex cursor-pointer items-start gap-3 border p-3 transition-colors"
                      >
                        <RadioGroupItem
                          id={`invitation-role-${id}`}
                          value={value}
                          className="mt-0.5"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <Icon className="size-3.5" aria-hidden="true" />
                            {label}
                          </span>
                          <span className="text-muted-foreground mt-1 block text-xs">
                            {description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FieldError>{errors.role?.message}</FieldError>
                </Field>
              )}
            />
          ) : (
            <div className="bg-muted/50 flex items-center gap-3 border p-3">
              <UserRound className="text-primary size-4" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Nhân viên kho</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Tài khoản sẽ được tạo với vai trò nhân viên kho.
                </p>
              </div>
            </div>
          )}

          {selectedRole === USER_ROLES.WarehouseStaff && (
            <Controller
              control={control}
              name="warehouseId"
              render={({ field }) => {
                const pickerPlaceholder = warehousesQuery.isLoading
                  ? 'Đang tải danh sách kho'
                  : warehousesQuery.isError
                    ? 'Không thể tải danh sách kho'
                    : activeWarehouses.length === 0
                      ? 'Không có kho đang hoạt động'
                      : 'Chọn kho khi cần'

                return (
                  <Field data-invalid={Boolean(errors.warehouseId)}>
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="invitation-warehouse">Kho làm việc</FieldLabel>
                      <span className="text-muted-foreground text-xs">Không bắt buộc</span>
                    </div>
                    <WarehousePicker
                      id="invitation-warehouse"
                      warehouses={activeWarehouses}
                      value={field.value}
                      invalid={Boolean(errors.warehouseId)}
                      disabled={
                        warehousesQuery.isLoading ||
                        warehousesQuery.isError ||
                        activeWarehouses.length === 0
                      }
                      placeholder={pickerPlaceholder}
                      onValueChange={field.onChange}
                    />
                    {warehousesQuery.isError ? (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-destructive text-xs" role="alert">
                          Danh sách kho chưa sẵn sàng.
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void warehousesQuery.refetch()}
                        >
                          <RefreshCw className="size-3.5" aria-hidden="true" />
                          Thử lại
                        </Button>
                      </div>
                    ) : (
                      <FieldDescription>
                        Nhân viên được gán vào kho sau khi chấp nhận lời mời.
                      </FieldDescription>
                    )}
                    <FieldError>{errors.warehouseId?.message}</FieldError>
                  </Field>
                )
              }}
            />
          )}
        </form>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={invitationMutation.isPending}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" form="invite-staff-form" disabled={invitationMutation.isPending}>
            {invitationMutation.isPending ? (
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
