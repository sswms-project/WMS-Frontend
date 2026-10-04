'use client'

import { ClipboardCheck, ClipboardList, PackageCheck, PackageOpen } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/routes/app-routes'

const tabs = [
  {
    href: APP_ROUTES.inboundRequests,
    label: 'Yêu cầu nhập kho',
    icon: ClipboardList,
    requiredPermission: P.INBOUND_REQUESTS_VIEW,
  },
  {
    href: APP_ROUTES.inbound,
    label: 'Chờ nhận hàng',
    icon: PackageOpen,
    requiredPermission: P.GOODS_RECEIPTS_VIEW,
  },
  {
    href: APP_ROUTES.goodsReceipts,
    label: 'Phiếu nhận hàng',
    icon: ClipboardCheck,
    requiredPermission: P.GOODS_RECEIPTS_VIEW,
  },
  {
    href: APP_ROUTES.inboundPutaway,
    label: 'Chờ cất hàng',
    icon: PackageCheck,
    requiredPermission: P.GOODS_RECEIPTS_VIEW,
  },
] as const

export function InboundTabs() {
  const pathname = usePathname()
  const permissions = new Set(useMeQuery().data?.permissions ?? [])
  const visibleTabs = tabs.filter((tab) => permissions.has(tab.requiredPermission))

  return (
    <nav
      className="flex max-w-full gap-1 overflow-x-auto border-b px-1 pb-1"
      aria-label="Nghiệp vụ nhập kho"
    >
      {visibleTabs.map((tab) => {
        const isActive =
          tab.href === APP_ROUTES.inbound ? pathname === tab.href : pathname.startsWith(tab.href)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href as Route}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'focus-visible:ring-ring inline-flex h-9 shrink-0 touch-manipulation items-center gap-2 rounded-sm border px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground border-transparent'
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
