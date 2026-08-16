'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/routes/app-routes'
import { useSubscriptionReadOnly } from './SubscriptionReadOnlyProvider'

export function SubscriptionReadOnlyBanner() {
  const { isReadOnly, reason } = useSubscriptionReadOnly()

  if (!isReadOnly) return null

  return (
    <Alert variant="destructive" className="mb-3">
      <ShieldAlert className="size-4" aria-hidden="true" />
      <AlertTitle>Tenant đang ở chế độ chỉ đọc</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{reason}</span>
        <Button asChild size="sm" variant="outline">
          <Link href={APP_ROUTES.subscription}>Gia hạn ngay</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
