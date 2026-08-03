'use client'

import { useState } from 'react'
import { PackageOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminSubscriptionPlansQuery } from '../hooks/use-admin'
import {
  SubscriptionPlanCard,
  SubscriptionPlanFormDialog,
} from '../components/SubscriptionPlansPage'

export function SubscriptionPlansPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data: plans, isLoading, isError } = useAdminSubscriptionPlansQuery()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Tạo gói mới
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-16">
          <PackageOpen className="text-destructive size-10" aria-hidden="true" />
          <p className="text-sm">Không thể tải danh sách gói đăng ký. Vui lòng thử lại.</p>
        </div>
      )}

      {plans && plans.length === 0 && (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-16">
          <PackageOpen className="size-10" aria-hidden="true" />
          <p className="text-sm">Chưa có gói đăng ký nào đang được cung cấp.</p>
        </div>
      )}

      {plans && plans.length > 0 && (
        <div className="space-y-3">
          {plans.map((plan) => (
            <SubscriptionPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      <SubscriptionPlanFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
