'use client'

import {
  CalendarClock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Warehouse,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { USER_ROLES } from '@/config/roles'
import { useAssignmentWarehousesQuery } from '../../hooks/use-manager-assignment'
import type { WarehouseAssignmentQuery } from '../../types/manager-assignment.types'
import type { StaffResponse } from '../../types/staff.types'
import { getAssignedWarehouseIds, resolveStaffWarehouseScope } from '../../utils/staff-warehouse'
import { StaffStatusBadge } from './StaffStatusBadge'

const staffWarehouseQuery: WarehouseAssignmentQuery = {
  top: 1000,
  skip: 0,
  needTotalCount: true,
}

interface StaffDetailsSheetProps {
  readonly open: boolean
  readonly person?: StaffResponse
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function StaffDetailsSheet({
  open,
  person,
  isLoading,
  isError,
  onOpenChange,
}: StaffDetailsSheetProps) {
  const isWarehouseStaff = person?.role === USER_ROLES.WarehouseStaff
  const assignedWarehouseIds = person && isWarehouseStaff ? getAssignedWarehouseIds(person) : []
  const warehousesQuery = useAssignmentWarehousesQuery(
    staffWarehouseQuery,
    open && assignedWarehouseIds.length > 0
  )
  const warehouseScope = resolveStaffWarehouseScope(
    assignedWarehouseIds,
    warehousesQuery.data?.items ?? []
  )
  const details = person
    ? [
        { label: 'Email', value: person.email, icon: Mail },
        { label: 'Điện thoại', value: person.phone || 'Chưa cập nhật', icon: Phone },
        { label: 'Vai trò', value: person.role || 'Chưa gán', icon: ShieldCheck },
        {
          label: 'Lần đăng nhập cuối',
          value: person.lastLoginAt
            ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(
                new Date(person.lastLoginAt)
              )
            : 'Chưa đăng nhập',
          icon: CalendarClock,
        },
      ]
    : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Chi tiết nhân sự</SheetTitle>
          <SheetDescription>Thông tin hiện có từ hồ sơ tài khoản trong tenant.</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4 p-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        )}

        {isError && <p className="text-destructive p-4 text-sm">Không thể tải chi tiết nhân sự.</p>}

        {person && (
          <div>
            <div className="flex items-start gap-3 border-b p-4">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center">
                <UserRound className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold">{person.fullName}</p>
                <div className="mt-1.5">
                  <StaffStatusBadge status={person.status} />
                </div>
              </div>
            </div>
            <dl className="divide-y">
              {details.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex gap-3 px-4 py-3.5">
                  <Icon
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {isWarehouseStaff && (
              <section className="border-t" aria-labelledby="staff-warehouse-scope-title">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Warehouse className="text-muted-foreground size-4" aria-hidden="true" />
                    <h3 id="staff-warehouse-scope-title" className="text-sm font-semibold">
                      Kho được phân công
                    </h3>
                  </div>
                  <Badge variant="outline">{assignedWarehouseIds.length}</Badge>
                </div>

                {assignedWarehouseIds.length === 0 && (
                  <p className="text-muted-foreground border-t px-4 py-5 text-sm">
                    Nhân sự chưa được gán kho.
                  </p>
                )}

                {assignedWarehouseIds.length > 0 && warehousesQuery.isLoading && (
                  <div className="space-y-2 border-t p-4" aria-label="Đang tải kho được phân công">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}

                {assignedWarehouseIds.length > 0 && warehousesQuery.isError && (
                  <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
                    <p className="text-destructive text-xs">Không thể tải thông tin kho.</p>
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

                {assignedWarehouseIds.length > 0 &&
                  !warehousesQuery.isLoading &&
                  !warehousesQuery.isError && (
                    <ul className="divide-y border-t">
                      {warehouseScope.warehouses.map((warehouse) => (
                        <li key={warehouse.id} className="flex items-start gap-3 px-4 py-3">
                          <span className="bg-primary/10 text-primary flex h-8 min-w-14 shrink-0 items-center justify-center px-2 text-[11px] font-semibold">
                            {warehouse.warehouseCode}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium break-words">
                              {warehouse.warehouseName}
                            </span>
                            <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                              {warehouse.address || 'Chưa cập nhật địa chỉ'}
                            </span>
                          </span>
                          <Badge variant={warehouse.status === 'Active' ? 'secondary' : 'outline'}>
                            {warehouse.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                          </Badge>
                        </li>
                      ))}
                      {warehouseScope.unresolvedCount > 0 && (
                        <li className="text-muted-foreground px-4 py-3 text-xs">
                          {warehouseScope.unresolvedCount} kho hiện không có trong danh sách khả
                          dụng.
                        </li>
                      )}
                    </ul>
                  )}
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
