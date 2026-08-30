'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Boxes, ChevronDown, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { USER_ROLES } from '@/config/roles'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import {
  getVisibleNavSections,
  isNavItemActive,
  isNavSectionActive,
  type NavItem,
  type NavSection,
} from './nav-config'

type SidebarAppearance = 'default' | 'tenant'

interface SidebarNavigationItemProps {
  readonly item: NavItem
  readonly isActive: boolean
  readonly isNested?: boolean
  readonly onNavigate: () => void
  readonly appearance: SidebarAppearance
}

interface SidebarNavigationSectionProps {
  readonly pathname: string
  readonly section: NavSection
  readonly onNavigate: () => void
  readonly appearance: SidebarAppearance
}

interface PlannedNavigationTooltipProps {
  readonly children: ReactNode
}

interface SidebarNavigationErrorStateProps {
  readonly onRetry: () => void
}

const NAVIGATION_SKELETON_ITEMS = [
  'dashboard',
  'organization',
  'warehouse',
  'catalog',
  'operations',
]

function PlannedNavigationTooltip({ children }: PlannedNavigationTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block w-full cursor-not-allowed">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        Chức năng đang phát triển
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarNavigationLoadingState() {
  return (
    <SidebarGroup className="px-3 py-2">
      <p role="status" className="sr-only">
        Đang tải điều hướng…
      </p>
      <SidebarMenu className="gap-1">
        {NAVIGATION_SKELETON_ITEMS.map((item) => (
          <SidebarMenuItem key={item}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function SidebarNavigationErrorState({ onRetry }: SidebarNavigationErrorStateProps) {
  return (
    <SidebarGroup className="px-3 py-2">
      <div role="alert" className="text-sidebar-foreground flex flex-col gap-2 px-2 text-xs">
        <p>Không thể tải quyền điều hướng.</p>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" onClick={onRetry} className="touch-manipulation">
              <RefreshCw aria-hidden="true" />
              <span>Thử lại</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </SidebarGroup>
  )
}

function SidebarNavigationItem({
  item,
  isActive,
  isNested = false,
  onNavigate,
  appearance,
}: SidebarNavigationItemProps) {
  const Icon = item.icon

  if (!item.href || item.status === 'planned') {
    const unavailableLabel = `${item.label} - Chức năng đang phát triển`

    if (isNested) {
      return (
        <SidebarMenuSubItem>
          <PlannedNavigationTooltip>
            <SidebarMenuSubButton asChild className="min-h-10 touch-manipulation md:min-h-8">
              <button type="button" disabled aria-label={unavailableLabel} className="opacity-45">
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            </SidebarMenuSubButton>
          </PlannedNavigationTooltip>
        </SidebarMenuSubItem>
      )
    }

    return (
      <SidebarMenuItem>
        <PlannedNavigationTooltip>
          <SidebarMenuButton asChild className="h-10 touch-manipulation">
            <button type="button" disabled aria-label={unavailableLabel} className="opacity-45">
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          </SidebarMenuButton>
        </PlannedNavigationTooltip>
      </SidebarMenuItem>
    )
  }

  if (isNested) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          isActive={isActive}
          className="min-h-10 touch-manipulation gap-2.5 rounded-md px-2 text-xs data-[active=true]:font-semibold md:min-h-8"
        >
          <Link
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            onNavigate={onNavigate}
          >
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={cn(
          'h-10 min-w-0 touch-manipulation gap-3 rounded-md px-3 text-sm font-medium',
          appearance === 'tenant'
            ? 'data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground'
            : 'data-[active=true]:shadow-[inset_3px_0_0_var(--color-sidebar-primary)] [&_svg]:size-[18px]'
        )}
      >
        <Link href={item.href} aria-current={isActive ? 'page' : undefined} onNavigate={onNavigate}>
          <Icon aria-hidden="true" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function CollapsibleNavigationSection({
  pathname,
  section,
  onNavigate,
  appearance,
}: SidebarNavigationSectionProps) {
  if (!section.label || !section.icon) return null

  const Icon = section.icon
  const isActive = isNavSectionActive(pathname, section)

  return (
    <Collapsible
      key={`${section.id}-${isActive ? 'active' : 'inactive'}`}
      defaultOpen={isActive}
      className="group/collapsible"
    >
      <SidebarGroup className="px-3 py-1.5">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={isActive}
                  className="data-[active=true]:text-sidebar-primary h-10 touch-manipulation gap-3 rounded-md px-3 text-sm font-semibold data-[active=true]:bg-transparent"
                >
                  <Icon aria-hidden="true" />
                  <span>{section.label}</span>
                  <ChevronDown
                    className="ml-auto transition-transform duration-150 group-data-[state=open]/collapsible:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 animation-duration-200 motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
                <SidebarMenuSub className="border-sidebar-border/80 mx-4 gap-0.5 px-2.5 py-1">
                  {section.items.map((item) => (
                    <SidebarNavigationItem
                      key={item.href ?? `${section.id}-${item.label}`}
                      item={item}
                      isActive={isNavItemActive(pathname, item)}
                      isNested
                      onNavigate={onNavigate}
                      appearance={appearance}
                    />
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Collapsible>
  )
}

function StandardNavigationSection({
  pathname,
  section,
  onNavigate,
  appearance,
}: SidebarNavigationSectionProps) {
  return (
    <SidebarGroup className="px-3 py-1.5">
      {section.label ? (
        <SidebarGroupLabel className="h-8 px-2 text-[11px] font-semibold uppercase">
          {section.label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent className="min-w-0">
        <SidebarMenu className="gap-1">
          {section.items.map((item) => (
            <SidebarNavigationItem
              key={item.href ?? `${section.id}-${item.label}`}
              item={item}
              isActive={isNavItemActive(pathname, item)}
              onNavigate={onNavigate}
              appearance={appearance}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function SidebarNavigationSection(props: SidebarNavigationSectionProps) {
  if (props.section.collapsible) {
    return <CollapsibleNavigationSection {...props} />
  }

  return <StandardNavigationSection {...props} />
}

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
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  useEffect(() => {
    if (!meQuery.isError) return

    logger.error(meQuery.error)
    toast.error('Không thể tải quyền điều hướng. Vui lòng thử lại.')
  }, [meQuery.error, meQuery.isError])

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border min-w-0 overflow-hidden">
      <SidebarHeader className="border-sidebar-border min-w-0 shrink-0 overflow-hidden border-b px-4 py-4">
        <div className="flex min-h-10 min-w-0 items-center gap-3">
          <span
            className={cn(
              'bg-sidebar-accent flex shrink-0 items-center justify-center rounded-md',
              appearance === 'tenant' ? 'border-sidebar-primary/40 size-10 border' : 'size-9'
            )}
          >
            <Boxes className="text-sidebar-accent-foreground size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                'text-sidebar-foreground truncate font-bold',
                appearance === 'tenant'
                  ? 'font-logo text-xl leading-6 tracking-wide'
                  : 'text-sm leading-5'
              )}
              translate="no"
            >
              KOVIA
            </p>
            <p className="text-sidebar-foreground/65 truncate text-xs leading-4">
              Hệ thống vận hành kho
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="min-w-0 overscroll-contain py-2">
        <nav aria-label="Điều hướng chính" className="min-w-0">
          {meQuery.isPending && !hasPermissionData ? <SidebarNavigationLoadingState /> : null}
          {meQuery.isError && !hasPermissionData ? (
            <SidebarNavigationErrorState onRetry={() => void meQuery.refetch()} />
          ) : null}
          {hasPermissionData
            ? sections.map((section, sectionIndex) => (
                <div key={section.id} className="min-w-0">
                  {(section.separatorBefore ?? sectionIndex > 0) ? (
                    <SidebarSeparator className="mx-3" />
                  ) : null}
                  <SidebarNavigationSection
                    pathname={pathname}
                    section={section}
                    onNavigate={closeMobileSidebar}
                    appearance={appearance}
                  />
                </div>
              ))
            : null}
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}
