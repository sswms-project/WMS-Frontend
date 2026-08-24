'use client'

import { ClipboardCheck, PackageCheck, PackageOpen } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/routes/app-routes'

const tabs = [
  { href: APP_ROUTES.inbound, label: 'Chờ nhận hàng', icon: PackageOpen },
  { href: APP_ROUTES.inboundReceipts, label: 'Phiếu nhập', icon: ClipboardCheck },
  { href: APP_ROUTES.inboundPutaway, label: 'Chờ cất hàng', icon: PackageCheck },
] as const

export function InboundTabs() {
  const pathname = usePathname()
  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto border-b" aria-label="Nghiệp vụ nhập kho">
      {tabs.map((tab) => {
        const isActive =
          tab.href === APP_ROUTES.inbound ? pathname === tab.href : pathname.startsWith(tab.href)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href as Route}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'focus-visible:ring-ring inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-medium outline-none focus-visible:ring-2',
              isActive
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
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
