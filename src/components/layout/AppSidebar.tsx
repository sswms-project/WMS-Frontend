'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Boxes } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth.store'
import { isNavItemActive, NAV_CONFIG } from './nav-config'

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const sections = user?.role ? (NAV_CONFIG[user.role] ?? []) : []

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border">
      <SidebarHeader className="border-sidebar-border border-b px-4 py-4">
        <div className="flex min-h-10 items-center gap-3">
          <span className="bg-sidebar-accent flex size-9 shrink-0 items-center justify-center rounded-md">
            <Boxes className="text-sidebar-accent-foreground size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sidebar-foreground truncate text-sm leading-5 font-bold">KOVIA</p>
            <p className="text-sidebar-foreground/65 truncate text-xs leading-4">
              Hệ thống vận hành kho
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {sections.map((section, sectionIndex) => (
          <div key={section.id}>
            {sectionIndex > 0 && <SidebarSeparator className="mx-3" />}
            <SidebarGroup className="px-3 py-2">
              {section.label && (
                <SidebarGroupLabel className="h-8 px-2 text-[11px] font-semibold uppercase">
                  {section.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {section.items.map((item) => {
                    const active = isNavItemActive(pathname, item)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className="h-10 gap-3 rounded-md px-3 text-sm font-medium data-[active=true]:shadow-[inset_3px_0_0_var(--color-sidebar-primary)] [&_svg]:size-[18px]"
                        >
                          <Link
                            href={item.href as Route}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false)
                            }}
                          >
                            <item.icon aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
