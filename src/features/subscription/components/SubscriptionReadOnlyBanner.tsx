'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { USER_ROLES } from '@/config/roles'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'
import { useSubscriptionReadOnly } from './SubscriptionReadOnlyProvider'

export function SubscriptionReadOnlyBanner() {
  const { isReadOnly, reason } = useSubscriptionReadOnly()
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner

  if (!isReadOnly) return null

  return (
    <Alert variant="destructive" className="mb-3">
      <ShieldAlert className="size-4" aria-hidden="true" />
      <AlertTitle>Tenant đang ở chế độ chỉ đọc</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{reason}</span>
        {isTenantOwner && (
          <Button asChild size="sm" variant="outline">
            <Link href={APP_ROUTES.subscription}>Gia hạn ngay</Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
