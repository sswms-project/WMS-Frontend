'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Building2, Check, LoaderCircle, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_LABELS_VI } from '@/config/roles'
import { useLogoutMutation } from '@/features/auth'
import { useSwitchTenantMutation, useTenantMembershipsQuery } from '@/features/auth/hooks/use-auth'
import { decodeJwtUser } from '@/features/auth/utils/decode-jwt-user'
import { getApiErrorMessage } from '@/lib/api-error'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function UserMenu() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setAuth = useAuthStore((state) => state.setAuth)
  const logoutMutation = useLogoutMutation()
  const membershipsQuery = useTenantMembershipsQuery(Boolean(user?.tenantId))
  const switchTenantMutation = useSwitchTenantMutation()

  if (!user) return null
  const activeMemberships = membershipsQuery.data?.filter(
    (membership) => membership.status === 'Active'
  )

  function finishLogout() {
    clearAuth()
    queryClient.clear()
    router.replace(APP_ROUTES.auth.login)
  }

  function handleLogout() {
    logoutMutation.mutate(undefined, { onSettled: finishLogout })
  }

  async function switchTenant(tenantId: string) {
    if (tenantId === user?.tenantId || switchTenantMutation.isPending) return
    try {
      const response = await switchTenantMutation.mutateAsync({ tenantId })
      const accessToken = response.data.accessToken?.trim()
      const refreshToken = response.data.refreshToken?.trim()
      if (!accessToken || !refreshToken)
        throw new Error('Máy chủ không trả về phiên đăng nhập hợp lệ.')
      setAuth(decodeJwtUser(accessToken), accessToken, refreshToken)
      queryClient.clear()
      router.replace(APP_ROUTES.dashboard)
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể chuyển tổ chức. Vui lòng thử lại.'))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Mở menu tài khoản của ${user.fullName}`}
          className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1 transition-colors"
        >
          <Avatar>
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-foreground text-[13px] leading-tight font-medium">{user.fullName}</p>
            <p className="text-muted-foreground text-[11px] leading-tight">
              {ROLE_LABELS_VI[user.role]}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-foreground text-sm font-medium">{user.fullName}</p>
          <p className="text-muted-foreground text-xs font-normal">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(activeMemberships?.length ?? 0) > 1 && (
          <>
            <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2 text-xs font-normal">
              <Building2 className="size-3.5" aria-hidden="true" />
              Tổ chức làm việc
            </DropdownMenuLabel>
            {activeMemberships?.map((membership) => (
              <DropdownMenuItem
                key={membership.tenantId}
                disabled={switchTenantMutation.isPending}
                onSelect={(event) => {
                  event.preventDefault()
                  void switchTenant(membership.tenantId)
                }}
              >
                <span className="min-w-0 flex-1 truncate">{membership.tenantName}</span>
                {membership.isCurrent && (
                  <Check className="text-primary size-4" aria-label="Tổ chức hiện tại" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.profile}>
            <User className="size-4" aria-hidden="true" />
            Hồ sơ cá nhân
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logoutMutation.isPending}
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
          variant="destructive"
        >
          {logoutMutation.isPending ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <LogOut className="size-4" aria-hidden="true" />
          )}
          {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
