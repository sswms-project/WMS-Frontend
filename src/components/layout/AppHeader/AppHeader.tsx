import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { PageHeading } from '@/components/PageHeading'
import { AppHeaderActions } from './AppHeaderActions'

export function AppHeader() {
  return (
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b px-3 backdrop-blur-sm sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
        <PageHeading />
      </div>
      <AppHeaderActions />
    </header>
  )
}
