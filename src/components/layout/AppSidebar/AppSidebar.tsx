'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Boxes } from 'lucide-react'
import { toast } from 'sonner'
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from '@/components/ui/sidebar'
import { USER_ROLES } from '@/config/roles'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { getVisibleNavSections } from '../nav-config'
import { SidebarNavigation, type SidebarAppearance } from './SidebarNavigation'

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const meQuery = useMeQuery()
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const permissions = new Set(meQuery.data?.permissions ?? [])
  const hasPermissionData = meQuery.data !== undefined
  const sections =
    user?.role && hasPermissionData ? getVisibleNavSections(user.role, permissions) : []
  const appearance: SidebarAppearance = user?.role === USER_ROLES.TenantOwner ? 'tenant' : 'default'

  useEffect(() => {
    if (!meQuery.isError) return

    logger.error(meQuery.error)
    toast.error('Không thể tải quyền điều hướng. Vui lòng thử lại.')
  }, [meQuery.error, meQuery.isError])

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-sidebar-border min-w-0 overflow-hidden border-r-0"
    >
      <SidebarHeader className="border-sidebar-border h-12 min-w-0 shrink-0 overflow-hidden border-b px-3 py-1.5">
        <div className="border-sidebar-border bg-sidebar-accent/30 flex h-full min-w-0 items-center gap-3 rounded-xl border px-3">
          <span
            className={cn(
              'bg-sidebar-primary text-sidebar-primary-foreground flex shrink-0 items-center justify-center rounded-lg',
              appearance === 'tenant' ? 'size-9' : 'size-8'
            )}
          >
            <Boxes className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                'text-sidebar-foreground truncate leading-5 font-bold',
                appearance === 'tenant' ? 'font-logo text-lg tracking-wide' : 'text-sm'
              )}
              translate="no"
            >
              KOVIA
            </p>
            <p className="text-sidebar-foreground/55 truncate text-[11px] leading-4">
              Hệ thống vận hành kho
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="min-w-0 overscroll-contain py-3">
        <SidebarNavigation
          pathname={pathname}
          sections={sections}
          isPending={meQuery.isPending}
          isError={meQuery.isError}
          hasPermissionData={hasPermissionData}
          onRetry={() => void meQuery.refetch()}
          onNavigate={() => {
            if (isMobile) setOpenMobile(false)
          }}
          appearance={appearance}
        />
      </SidebarContent>
    </Sidebar>
  )
}
