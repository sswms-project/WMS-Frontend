import { AiAssistantLauncher } from '@/features/ai-assistant/components/AiAssistantPanel/AiAssistantLauncher'
import { NotificationHeaderController } from '@/features/platform-services/components/NotificationHeaderController'
import { UserMenu } from '@/components/UserMenu'
import { ThemeToggle } from '../ThemeToggle'

export function AppHeaderActions() {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <AiAssistantLauncher />
      <NotificationHeaderController />
      <div className="hidden sm:block">
        <ThemeToggle />
      </div>
      <UserMenu />
    </div>
  )
}
