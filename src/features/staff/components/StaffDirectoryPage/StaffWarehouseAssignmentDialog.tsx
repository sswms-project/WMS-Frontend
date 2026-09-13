'use client'

import { AlertTriangle, LoaderCircle, RefreshCw, Save, Search, Warehouse } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import type { UseFormReturn } from 'react-hook-form'
import type { UpdateStaffWarehousesRequest } from '../../schemas/update-staff-warehouses.schema'
import type { StaffResponse } from '../../types/staff.types'
import type { StaffWarehouseOption } from '../../types/manager-assignment.types'
import { StaffDirectoryPagination } from './StaffDirectoryPagination'

interface StaffWarehouseAssignmentDialogProps {
  readonly form: UseFormReturn<UpdateStaffWarehousesRequest>
  readonly person: StaffResponse
  readonly warehouses: readonly StaffWarehouseOption[]
  readonly selectedIds: readonly string[]
  readonly replacements: readonly StaffWarehouseOption[]
  readonly confirmed: boolean
  readonly search: string
  readonly page: number
  readonly totalCount: number
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isStale: boolean
  readonly isPending: boolean
  readonly canSave: boolean
  readonly errorMessage?: string
  readonly onSearch: (value: string) => void
  readonly onPage: (page: number) => void
  readonly onToggle: (warehouseId: string) => void
  readonly onConfirm: (confirmed: boolean) => void
  readonly onRefresh: () => void
  readonly onClose: () => void
  readonly onSave: () => void
}

export function StaffWarehouseAssignmentDialog({
  form,
  person,
  warehouses,
  selectedIds,
  replacements,
  confirmed,
  search,
  page,
  totalCount,
  isLoading,
  isError,
  isStale,
  isPending,
  canSave,
  errorMessage,
  onSearch,
  onPage,
  onToggle,
  onConfirm,
  onRefresh,
  onClose,
  onSave,
}: StaffWarehouseAssignmentDialogProps) {
  const validationMessage = form.formState.errors.warehouseIds?.message
  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto sm:max-w-xl">
        <DialogHeader className="border-b pr-8 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Warehouse className="text-primary size-4" aria-hidden="true" />
            Phân công kho
          </DialogTitle>
          <DialogDescription className="break-words">
            {person.fullName} · {person.email}
          </DialogDescription>
        </DialogHeader>
        {(errorMessage || isError) && (
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Chưa thể cập nhật phân công</AlertTitle>
            <AlertDescription>{errorMessage || 'Không thể tải danh sách kho.'}</AlertDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              disabled={isLoading || isPending}
              onClick={onRefresh}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Tải lại dữ liệu
            </Button>
          </Alert>
        )}
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">Kho làm việc</span>
          <span className="text-muted-foreground" role="status">
            {selectedIds.length} kho đã chọn
          </span>
        </div>
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-3 left-3 size-4"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            disabled={isPending}
            aria-label="Tìm kho"
            placeholder="Tìm theo tên hoặc mã kho"
            className="pl-9"
          />
        </div>
        <div className="min-h-32" aria-busy={isLoading}>
          {isLoading ? (
            <p role="status" className="text-muted-foreground py-10 text-center text-sm">
              Đang tải phân công kho...
            </p>
          ) : (
            !isError &&
            (warehouses.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                {search ? 'Không tìm thấy kho phù hợp.' : 'Chưa có kho khả dụng.'}
              </p>
            ) : (
              <div className="divide-y border-y">
                {warehouses.map((warehouse) => {
                  const selected = selectedIds.includes(warehouse.id)
                  return (
                    <label
                      key={warehouse.id}
                      className="hover:bg-muted/50 has-[[data-state=checked]]:bg-primary/5 flex min-h-16 cursor-pointer items-center gap-3 px-2 py-3 transition-colors duration-150 motion-reduce:transition-none"
                    >
                      <Checkbox
                        checked={selected}
                        disabled={
                          isPending || isStale || (warehouse.status !== 'Active' && !selected)
                        }
                        onCheckedChange={() => onToggle(warehouse.id)}
                        aria-label={warehouse.warehouseName}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium break-words">
                          {warehouse.warehouseName}
                        </span>
                        <span className="text-muted-foreground mt-0.5 block text-xs break-words">
                          {warehouse.warehouseCode}
                          {warehouse.status !== 'Active' ? ' · Ngừng hoạt động' : ''}
                        </span>
                        {warehouse.managerId && (
                          <span className="text-muted-foreground mt-1 block text-xs break-words">
                            Quản lý: {warehouse.managerName || warehouse.managerId}
                          </span>
                        )}
                      </span>
                    </label>
                  )
                })}
              </div>
            ))
          )}
        </div>
        {!isLoading && !isError && totalCount > 20 && (
          <StaffDirectoryPagination
            page={page}
            pageSize={20}
            totalCount={totalCount}
            onPageChange={onPage}
          />
        )}
        {validationMessage && (
          <p role="alert" className="text-destructive text-sm">
            {validationMessage}
          </p>
        )}
        {replacements.length > 0 && (
          <Alert className="border-warning/60 bg-warning-container/30 text-on-warning-container">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Thay người phụ trách</AlertTitle>
            <AlertDescription className="block">
              <ul className="my-2 space-y-1">
                {replacements.map((warehouse) => (
                  <li key={warehouse.id} className="break-words">
                    {warehouse.warehouseName}: {warehouse.managerName || warehouse.managerId} →{' '}
                    {person.fullName}
                  </li>
                ))}
              </ul>
              <label className="flex min-h-11 cursor-pointer items-start gap-2 py-2">
                <Checkbox
                  checked={confirmed}
                  disabled={isPending || isStale || isLoading || isError}
                  onCheckedChange={(value) => onConfirm(value === true)}
                  className="mt-0.5"
                />
                <span>
                  Tôi xác nhận gỡ manager hiện tại khỏi các kho trên. Các kho khác của họ được giữ
                  nguyên.
                </span>
              </label>
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="button" disabled={!canSave || isPending || isLoading} onClick={onSave}>
            {isPending ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Lưu phân công
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
