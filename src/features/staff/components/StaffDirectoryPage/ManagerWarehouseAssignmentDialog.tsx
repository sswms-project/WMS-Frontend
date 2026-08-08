'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  LoaderCircle,
  RefreshCw,
  Search,
  TriangleAlert,
  Warehouse,
  X,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '../../hooks/use-debounced-value'
import {
  useAssignmentWarehousesQuery,
  useAssignManagerMutation,
} from '../../hooks/use-manager-assignment'
import {
  managerAssignmentSchema,
  type ManagerAssignmentFormValues,
} from '../../schemas/manager-assignment.schema'
import type { WarehouseAssignmentQuery } from '../../types/manager-assignment.types'
import type { StaffResponse } from '../../types/staff.types'

interface ManagerWarehouseAssignmentDialogProps {
  readonly manager: StaffResponse
  readonly onOpenChange: (open: boolean) => void
}

function warehouseStatusLabel(status: string) {
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Inactive') return 'Ngừng hoạt động'
  return status
}

export function ManagerWarehouseAssignmentDialog({
  manager,
  onOpenChange,
}: ManagerWarehouseAssignmentDialogProps) {
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebouncedValue(searchText.trim(), 300)
  const params: WarehouseAssignmentQuery = {
    top: 20,
    skip: 0,
    needTotalCount: true,
    ...(debouncedSearchText ? { searchText: debouncedSearchText } : {}),
  }
  const warehousesQuery = useAssignmentWarehousesQuery(params, true)
  const assignMutation = useAssignManagerMutation()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerAssignmentFormValues>({
    resolver: zodResolver(managerAssignmentSchema),
    defaultValues: { warehouseId: '' },
  })

  function handleOpenChange(open: boolean) {
    if (assignMutation.isPending) return
    if (!open) {
      reset()
      setSearchText('')
      assignMutation.reset()
    }
    onOpenChange(open)
  }

  async function submit(values: ManagerAssignmentFormValues) {
    try {
      await assignMutation.mutateAsync({
        warehouseId: values.warehouseId,
        request: { managerId: manager.id },
      })
      toast.success(`Đã gán ${manager.fullName} vào kho.`)
      onOpenChange(false)
    } catch {
      // The API conflict or validation message stays visible in the dialog.
    }
  }

  const warehouses = warehousesQuery.data?.items ?? []

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="border-b p-4 pr-12">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Warehouse className="text-primary size-4" aria-hidden="true" />
            Gán quản lý vào kho
          </DialogTitle>
          <DialogDescription>
            Chọn kho để {manager.fullName} phụ trách. Mỗi kho chỉ có một quản lý đang hoạt động.
          </DialogDescription>
        </DialogHeader>

        <form id="manager-assignment-form" onSubmit={handleSubmit(submit)}>
          <div className="border-b p-4">
            <div className="bg-muted/50 flex items-center gap-3 border p-3">
              <div className="bg-background flex size-9 shrink-0 items-center justify-center border">
                <Building2 className="text-primary size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{manager.fullName}</p>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">{manager.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            {assignMutation.error && (
              <Alert variant="destructive">
                <Warehouse className="size-4" aria-hidden="true" />
                <AlertTitle>Không thể gán quản lý</AlertTitle>
                <AlertDescription>{assignMutation.error.message}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <TriangleAlert className="size-4" aria-hidden="true" />
              <AlertTitle>Quản lý hiện tại có thể bị thay thế</AlertTitle>
              <AlertDescription>
                Nếu kho đã có quản lý, hệ thống sẽ kết thúc phân công hiện tại và chuyển quyền phụ
                trách sang {manager.fullName}.
              </AlertDescription>
            </Alert>

            <Field data-invalid={Boolean(errors.warehouseId)}>
              <div className="flex items-end justify-between gap-3">
                <FieldLabel id="assignment-warehouse-label">Kho</FieldLabel>
                <span className="text-muted-foreground text-xs">
                  {warehousesQuery.data?.totalCount ?? 0} kết quả
                </span>
              </div>

              <InputGroup>
                <InputGroupAddon>
                  <Search className="size-4" aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchText}
                  aria-label="Tìm kho theo tên hoặc mã"
                  placeholder="Tìm theo tên hoặc mã kho"
                  onChange={(event) => setSearchText(event.target.value)}
                />
                {searchText && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Xóa nội dung tìm kho"
                      onClick={() => setSearchText('')}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>

              {warehousesQuery.isLoading && (
                <div className="space-y-2" aria-label="Đang tải danh sách kho">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              )}

              {warehousesQuery.isError && (
                <div className="flex min-h-32 flex-col items-center justify-center gap-2 border p-4 text-center">
                  <p className="text-sm font-medium">Không thể tải danh sách kho</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void warehousesQuery.refetch()}
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    Thử lại
                  </Button>
                </div>
              )}

              {!warehousesQuery.isLoading &&
                !warehousesQuery.isError &&
                warehouses.length === 0 && (
                  <div className="text-muted-foreground flex min-h-32 items-center justify-center border p-4 text-center text-sm">
                    Không tìm thấy kho phù hợp.
                  </div>
                )}

              {warehouses.length > 0 && (
                <Controller
                  control={control}
                  name="warehouseId"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      aria-labelledby="assignment-warehouse-label"
                      className="max-h-64 gap-0 overflow-y-auto border"
                      onValueChange={field.onChange}
                    >
                      {warehouses.map((warehouse) => (
                        <label
                          key={warehouse.id}
                          htmlFor={`assignment-warehouse-${warehouse.id}`}
                          className="has-data-checked:bg-primary/5 hover:bg-muted/60 flex cursor-pointer items-start gap-3 border-b p-3 transition-colors last:border-b-0"
                        >
                          <RadioGroupItem
                            id={`assignment-warehouse-${warehouse.id}`}
                            value={warehouse.id}
                            className="mt-1"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">{warehouse.warehouseName}</span>
                              <Badge variant="outline">{warehouse.warehouseCode}</Badge>
                              <Badge
                                variant={warehouse.status === 'Active' ? 'secondary' : 'outline'}
                              >
                                {warehouseStatusLabel(warehouse.status)}
                              </Badge>
                            </span>
                            <span className="text-muted-foreground mt-1 block truncate text-xs">
                              {warehouse.address || 'Chưa cập nhật địa chỉ'}
                            </span>
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              )}
              <FieldError>{errors.warehouseId?.message}</FieldError>
            </Field>
          </div>
        </form>

        <DialogFooter className="border-t p-4">
          <Button
            type="button"
            variant="outline"
            disabled={assignMutation.isPending}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="manager-assignment-form"
            disabled={assignMutation.isPending || warehousesQuery.isLoading}
          >
            {assignMutation.isPending ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Warehouse className="size-4" aria-hidden="true" />
            )}
            Gán vào kho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
