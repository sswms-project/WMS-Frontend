import { InboundTabs, type InboundTabsProps } from './InboundTabs'
import type { ReactNode } from 'react'

interface InboundPageHeaderProps extends InboundTabsProps {
  readonly title: string
  readonly action?: ReactNode
}

export function InboundPageHeader({
  title,
  action,
  canViewRequests,
  canViewReceipts,
}: InboundPageHeaderProps) {
  return (
    <header className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="sr-only">{title}</h1>
      <div className="min-w-0 flex-1">
        <InboundTabs canViewRequests={canViewRequests} canViewReceipts={canViewReceipts} />
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
