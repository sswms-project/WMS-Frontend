import { PackageOpen } from 'lucide-react'
import { InboundTabs } from './InboundTabs'

export function InboundPageHeader({
  title,
  description,
}: {
  readonly title: string
  readonly description: string
}) {
  return (
    <header className="flex shrink-0 flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
          <PackageOpen aria-hidden="true" />
        </span>
        <div>
          <p className="text-primary text-xs font-medium">Vận hành nhập kho</p>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{description}</p>
        </div>
      </div>
      <InboundTabs />
    </header>
  )
}
