'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useSubscriptionReadOnly } from './SubscriptionReadOnlyProvider'

const WRITE_ALLOWED_PREFIXES = [
  '/subscription',
  '/profile',
  '/settings',
  '/notifications',
  '/audit-logs',
  '/admin',
]

export function SubscriptionWriteGuard({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname()
  const { isReadOnly } = useSubscriptionReadOnly()
  const isBillingOrAccountRoute = WRITE_ALLOWED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (!isReadOnly || isBillingOrAccountRoute) return children

  return (
    <fieldset disabled className="contents" aria-label="Nội dung nghiệp vụ ở chế độ chỉ đọc">
      {children}
    </fieldset>
  )
}
