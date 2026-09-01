import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppHeader, AppSidebar } from '@/components/layout'
import { PageTransition } from '@/components/PageTransition'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SubscriptionReadOnlyBanner } from '@/features/subscription/components/SubscriptionReadOnlyBanner'
import { SubscriptionReadOnlyProvider } from '@/features/subscription/components/SubscriptionReadOnlyProvider'
import { NotificationRealtimeProvider } from '@/features/platform-services/providers/NotificationRealtimeProvider'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TooltipProvider>
        <NotificationRealtimeProvider>
          <SubscriptionReadOnlyProvider>
            <SidebarProvider
              className="h-svh min-h-0 overflow-hidden print:h-auto print:overflow-visible"
              style={{ '--sidebar-width': '17.5rem' } as React.CSSProperties}
            >
              <div className="print:hidden">
                <AppSidebar />
              </div>
              <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden print:m-0 print:block print:h-auto print:overflow-visible">
                <div className="print:hidden">
                  <AppHeader />
                </div>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4 lg:p-5 print:overflow-visible print:p-0">
                  <div className="shrink-0 print:hidden">
                    <SubscriptionReadOnlyBanner />
                  </div>
                  <PageTransition>{children}</PageTransition>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </SubscriptionReadOnlyProvider>
        </NotificationRealtimeProvider>
      </TooltipProvider>
    </ProtectedRoute>
  )
}
