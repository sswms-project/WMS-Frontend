import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { NotificationBell } from '@/components/NotificationBell'
import { PageHeading } from '@/components/PageHeading'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import { notifications } from '@/features/dashboard/utils/sample-data'

export function AppHeader() {
  return (
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b px-3 backdrop-blur-sm sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
        <PageHeading />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <NotificationBell notifications={notifications} />
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <Separator orientation="vertical" className="mx-1 hidden h-4 sm:block lg:mx-2" />
        <UserMenu />
      </div>
    </header>
  )
}
