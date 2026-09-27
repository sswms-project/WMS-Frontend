import { Boxes } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { PageHeading } from '@/components/PageHeading'
import { AppHeaderActions } from './AppHeaderActions'

export function AppHeader() {
  return (
    <header className="bg-sidebar border-sidebar-border sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-3 [--accent-foreground:var(--color-sidebar-accent-foreground)] [--accent:var(--color-sidebar-accent)] [--border:var(--color-sidebar-border)] [--foreground:rgb(255,255,255)] [--muted-foreground:rgba(255,255,255,0.55)] [--muted:var(--color-sidebar-accent)] sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Boxes className="size-4" aria-hidden="true" />
          </span>
          <div className="hidden min-w-0 sm:block">
            <p
              className="text-sidebar-foreground truncate text-sm leading-5 font-bold"
              translate="no"
            >
              KOVIA
            </p>
            <p className="text-sidebar-foreground/55 truncate text-[11px] leading-4">
              Hệ thống vận hành kho
            </p>
          </div>
        </div>
        <Separator orientation="vertical" className="bg-sidebar-border mr-1 hidden h-4 sm:block" />
        <div className="hidden min-w-0 sm:block">
          <PageHeading />
        </div>
      </div>
      <AppHeaderActions />
    </header>
  )
}
