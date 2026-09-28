'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { USER_ROLES } from '@/config/roles'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { logger } from '@/lib/logger'
import { useAuthStore } from '@/stores/auth.store'
import { getVisibleNavSections } from '../nav-config'
import { SidebarNavigation, type SidebarAppearance } from './SidebarNavigation'

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const meQuery = useMeQuery()
  const pathname = usePathname()
  const { isMobile, setOpenMobile, open, setOpen } = useSidebar()
  const hoverOpenRef = useRef(false)
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

  const handleMouseEnter = () => {
    if (!open && !isMobile) {
      hoverOpenRef.current = true
      setOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (hoverOpenRef.current) {
      hoverOpenRef.current = false
      setOpen(false)
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-sidebar-border min-w-0 overflow-hidden border-r-0"
    >
      <SidebarContent
        className="min-w-0 overscroll-contain py-3"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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
      <SidebarFooter className="border-sidebar-border shrink-0 border-t p-2">
        <SidebarTrigger className="w-full" />
      </SidebarFooter>
    </Sidebar>
  )
}
