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
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth.store'
import { NAV_CONFIG } from './nav-config'

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const pathname = usePathname()
  const nav = user?.role ? (NAV_CONFIG[user.role] ?? []) : []

  const mainNav = nav.filter((i) => i.href !== '/admin/roles' && i.href !== '/settings/security')
  const systemNav = nav.filter((i) => i.href === '/admin/roles' || i.href === '/settings/security')

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Sidebar collapsible="offcanvas">
      {/* Brand header */}
      <SidebarHeader
        className="px-4 py-3"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="bg-sidebar-accent flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Boxes className="text-sidebar-accent-foreground size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sidebar-foreground text-[13px] leading-tight font-bold tracking-widest">
              KOVIA
            </p>
            <p className="text-sidebar-foreground/50 text-[11px] leading-tight">
              Hệ thống vận hành kho
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = isActive(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="rounded-md"
                    >
                      <Link href={item.href as Route} aria-current={active ? 'page' : undefined}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System nav (Settings, Admin) — flows normally like Ba Hưng "Quản trị" section */}
        {systemNav.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemNav.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className="rounded-md"
                        >
                          <Link
                            href={item.href as Route}
                            aria-current={active ? 'page' : undefined}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
