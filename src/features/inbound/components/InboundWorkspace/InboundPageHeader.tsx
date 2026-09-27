import { PackageOpen } from 'lucide-react'
import { InboundTabs } from './InboundTabs'

export function InboundPageHeader({ title }: { readonly title: string }) {
  return (
    <header className="flex shrink-0 flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
          <PackageOpen aria-hidden="true" />
        </span>
        <div>
          <p className="text-primary text-xs font-medium">Vận hành nhập kho</p>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
      <InboundTabs />
    </header>
  )
}
