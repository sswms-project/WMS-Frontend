'use client'

import { LoaderCircle, MailPlus, RefreshCw, Search, ShieldCheck, UserRound, X } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

interface InviteStaffDialogProps {
  readonly open: boolean
  readonly canInviteManagers: boolean
  readonly form: UseFormReturn<InviteWithWarehouseFormValues>
  readonly warehouses: readonly WarehouseSummaryResponse[]
  readonly selectedWarehouses: readonly WarehouseSummaryResponse[]
  readonly warehouseSearch: string
  readonly isLoading: boolean
  readonly isFetchingNextPage: boolean
  readonly hasNextPage: boolean
  readonly isError: boolean
  readonly isPending: boolean
  readonly errorMessage?: string
  readonly onRefresh: () => void
  readonly onWarehouseSearchChange: (value: string) => void
  readonly onLoadMore: () => void
  readonly onWarehouseSelectionChange: (
    warehouse: WarehouseSummaryResponse,
    selected: boolean
  ) => void
  readonly onRemoveWarehouse: (warehouseId: string) => void
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
  selectedWarehouses,
  warehouseSearch,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  isError,
  isPending,
  errorMessage,
  onRefresh,
  onWarehouseSearchChange,
  onLoadMore,
  onWarehouseSelectionChange,
  onRemoveWarehouse,
  onOpenChange,
  onSubmit,
}: InviteStaffDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form
  const unavailable = isLoading || isError || (!warehouseSearch.trim() && warehouses.length === 0)

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="border-b pr-8 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MailPlus className="text-primary size-4" aria-hidden="true" />
            Mời nhân sự
          </DialogTitle>
          <DialogDescription>Lời mời có hiệu lực trong 24 giờ.</DialogDescription>
        </DialogHeader>
        <form id="invite-staff-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Không thể gửi lời mời</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={Boolean(errors.fullName)}>
            <FieldLabel htmlFor="invitation-full-name">Họ và tên</FieldLabel>
            <Input
              id="invitation-full-name"
              autoComplete="name"
              autoFocus
              maxLength={300}
              disabled={isPending}
              aria-invalid={Boolean(errors.fullName)}
              placeholder="Nguyễn Văn A"
              {...register('fullName')}
            />
            <FieldError>{errors.fullName?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="invitation-email">Email</FieldLabel>
            <Input
              id="invitation-email"
              type="email"
              autoComplete="email"
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
            name="warehouseIds"
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.warehouseIds)}>
                <FieldLabel>Kho làm việc ban đầu</FieldLabel>
                <div className="relative">
                  <Search
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    value={warehouseSearch}
                    disabled={isPending}
                    className="pl-8"
                    placeholder="Tìm theo mã hoặc tên kho"
                    aria-label="Tìm kho"
                    onChange={(event) => onWarehouseSearchChange(event.target.value)}
                  />
                </div>
                {selectedWarehouses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5" aria-label="Kho đã chọn">
                    {selectedWarehouses.map((warehouse) => (
                      <Button
                        key={warehouse.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => onRemoveWarehouse(warehouse.id)}
                      >
                        {warehouse.warehouseCode}
                        <X data-icon="inline-end" aria-hidden="true" />
                        <span className="sr-only">Bỏ chọn {warehouse.warehouseName}</span>
                      </Button>
                    ))}
                  </div>
                )}
                {!unavailable && (
                  <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border p-2">
                    {warehouses.map((warehouse) => {
                      const checked = field.value.includes(warehouse.id)
                      return (
                        <label
                          key={warehouse.id}
                          className="hover:bg-muted flex min-h-10 cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5"
                        >
                          <Checkbox
                            checked={checked}
                            disabled={isPending}
                            onCheckedChange={(nextChecked) => {
                              const selected = nextChecked === true
                              const nextValue = selected
                                ? [...field.value, warehouse.id]
                                : field.value.filter((id) => id !== warehouse.id)
                              field.onChange(nextValue)
                              onWarehouseSelectionChange(warehouse, selected)
                            }}
                          />
                          <span className="min-w-0 text-sm">
                            <span className="font-medium">{warehouse.warehouseCode}</span>
                            <span className="text-muted-foreground">
                              {' '}
                              · {warehouse.warehouseName}
                            </span>
                          </span>
                        </label>
                      )
                    })}
                    {warehouses.length === 0 && !isLoading && (
                      <p className="text-muted-foreground py-4 text-center text-sm">
                        Không tìm thấy kho phù hợp.
                      </p>
                    )}
                    {hasNextPage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isFetchingNextPage || isPending}
                        onClick={onLoadMore}
                      >
                        {isFetchingNextPage && (
                          <LoaderCircle
                            data-icon="inline-start"
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        )}
                        Tải thêm kho
                      </Button>
                    )}
                  </div>
                )}
                {isError ? (
                  <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Thử lại
                  </Button>
                ) : (
                  <FieldDescription>
                    {warehouses.length === 0 && !isLoading && !warehouseSearch
                      ? 'Cần có kho hoạt động trước khi gửi lời mời.'
                      : 'Có thể chọn nhiều kho; các kho được gán sau khi người nhận kích hoạt tài khoản.'}
                  </FieldDescription>
                )}
                <FieldError>{errors.warehouseIds?.message}</FieldError>
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
