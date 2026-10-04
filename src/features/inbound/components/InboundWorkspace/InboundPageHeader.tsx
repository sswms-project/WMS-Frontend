import { PackageOpen } from 'lucide-react'
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
    <header className="flex shrink-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <PackageOpen aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Vận hành nhập kho</p>
            <h1 className="truncate text-xl font-semibold">{title}</h1>
          </div>
        </div>
        {action}
      </div>
      <InboundTabs canViewRequests={canViewRequests} canViewReceipts={canViewReceipts} />
    </header>
  )
}
