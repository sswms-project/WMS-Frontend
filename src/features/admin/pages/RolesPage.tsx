'use client'

import { ShieldAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRolesQuery } from '../hooks/use-admin'
import { RoleCard } from '../components/RolesPage'

export function RolesPage() {
  const { data: roles, isLoading, isError } = useRolesQuery()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 py-16">
        <ShieldAlert className="text-destructive size-10" aria-hidden="true" />
        <p className="text-sm">Không thể tải danh sách vai trò. Vui lòng thử lại.</p>
      </div>
    )
  }

  if (!roles?.length) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 py-16">
        <ShieldAlert className="size-10" aria-hidden="true" />
        <p className="text-sm">Chưa có vai trò nào trong hệ thống.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  )
}
