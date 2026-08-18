'use client'

import { CalendarClock, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { StaffResponse } from '../../types/staff.types'
import { StaffStatusBadge } from './StaffStatusBadge'

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
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
