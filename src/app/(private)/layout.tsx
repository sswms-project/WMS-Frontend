import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppHeader, AppSidebar } from '@/components/layout'
import { PageTransition } from '@/components/PageTransition'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SubscriptionReadOnlyBanner } from '@/features/subscription/components/SubscriptionReadOnlyBanner'
import { SubscriptionReadOnlyProvider } from '@/features/subscription/components/SubscriptionReadOnlyProvider'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TooltipProvider>
        <SubscriptionReadOnlyProvider>
          <SidebarProvider>
            <div className="print:hidden">
              <AppSidebar />
            </div>
            <SidebarInset className="min-w-0 overflow-x-hidden print:m-0 print:block">
              <div className="print:hidden">
                <AppHeader />
              </div>
              <div className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5 print:p-0">
                <div className="print:hidden">
                  <SubscriptionReadOnlyBanner />
                </div>
                <PageTransition>{children}</PageTransition>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </SubscriptionReadOnlyProvider>
      </TooltipProvider>
    </ProtectedRoute>
  )
}
