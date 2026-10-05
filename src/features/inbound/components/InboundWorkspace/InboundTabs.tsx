'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { APP_ROUTES } from '@/routes/app-routes'

const tabs = [
  {
    href: APP_ROUTES.inboundRequests,
    label: 'Yêu cầu nhập kho',
  },
  {
    href: APP_ROUTES.inbound,
    label: 'Chờ nhận hàng',
  },
  {
    href: APP_ROUTES.goodsReceipts,
    label: 'Phiếu nhận hàng',
  },
  {
    href: APP_ROUTES.inboundPutaway,
    label: 'Chờ cất hàng',
  },
] as const

export interface InboundTabsProps {
  readonly canViewRequests: boolean
  readonly canViewReceipts: boolean
}

export function InboundTabs({ canViewRequests, canViewReceipts }: InboundTabsProps) {
  const pathname = usePathname()
  const visibleTabs = tabs.filter((tab) =>
    tab.href === APP_ROUTES.inboundRequests ? canViewRequests : canViewReceipts
  )

  return (
    <nav data-slot="operational-workspace-navigation" aria-label="Nghiệp vụ nhập kho">
      {visibleTabs.map((tab) => {
        const isActive =
          tab.href === APP_ROUTES.inbound ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href as Route}
            aria-current={isActive ? 'page' : undefined}
            className="focus-visible:ring-ring touch-manipulation focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
