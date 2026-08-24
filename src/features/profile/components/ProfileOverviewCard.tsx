import type { ReactNode } from 'react'
import { CheckCircle2, Clock, Shield, ShieldOff, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROLE_LABELS_VI, type UserRole } from '@/config/roles'
import type { UserProfileResponse } from '@/features/auth/types/auth.types'
import { cn } from '@/lib/utils'

interface ProfileOverviewCardProps {
  readonly profile: UserProfileResponse | undefined
  readonly isLoading: boolean
}

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatLastLogin(lastLoginAt: string | null) {
  if (!lastLoginAt) return 'Chưa đăng nhập'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(lastLoginAt))
}

interface StatusRowProps {
  readonly icon: ReactNode
  readonly label: string
  readonly value: ReactNode
  readonly delay?: string
}

function StatusRow({ icon, label, value, delay = 'delay-0' }: StatusRowProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-left-2 fill-mode-both flex items-center justify-between gap-2 duration-300',
        delay
      )}
    >
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">{label}</div>
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {icon}
        {value}
      </div>
    </div>
  )
}

export function ProfileOverviewCard({ profile, isLoading }: ProfileOverviewCardProps) {
  if (isLoading) {
    return (
      <Card className="gap-0 py-0 lg:sticky lg:top-20">
        <CardContent className="flex flex-col items-center gap-4 px-4 py-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="w-full space-y-2 text-center">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-3 w-20" />
          </div>
          <div className="bg-border h-px w-full" />
          <div className="w-full space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  const roleLabel = profile.role ? (ROLE_LABELS_VI[profile.role as UserRole] ?? profile.role) : null
  const isActive = profile.status?.toLowerCase() === 'active'

  return (
    <Card className="animate-in fade-in slide-in-from-left-4 gap-0 py-0 duration-500 lg:sticky lg:top-20">
      <CardHeader className="border-b px-4.5 py-4">
        <p className="text-foreground text-[13px] font-bold">Tổng quan tài khoản</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-4.5 py-5">
        {/* Avatar + Name */}
        <div className="animate-in fade-in zoom-in-90 fill-mode-both flex flex-col items-center gap-3 text-center delay-100 duration-500">
          <div className="bg-primary/10 text-primary animate-in zoom-in-75 fill-mode-both flex size-16 items-center justify-center rounded-full text-xl font-bold tracking-tight delay-150 duration-500 select-none">
            {getInitials(profile.fullName)}
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-200 duration-400">
            <p className="text-foreground text-sm leading-tight font-semibold">
              {profile.fullName}
            </p>
            {roleLabel && (
              <Badge variant="outline" className="mt-1.5 text-[11px]">
                {roleLabel}
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-border animate-in fade-in fill-mode-both h-px delay-300 duration-300" />

        {/* Status rows */}
        <div className="space-y-3">
          <StatusRow
            delay="delay-300"
            label="Trạng thái"
            icon={
              <span
                className={cn(
                  'size-2 rounded-full',
                  isActive ? 'bg-chart-1' : 'bg-muted-foreground'
                )}
              />
            }
            value={
              <span className={isActive ? 'text-chart-1' : 'text-muted-foreground'}>
                {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </span>
            }
          />

          <StatusRow
            delay="delay-[375ms]"
            label="Email"
            icon={
              profile.emailVerified ? (
                <CheckCircle2 className="text-chart-1 size-3.5" />
              ) : (
                <XCircle className="text-muted-foreground size-3.5" />
              )
            }
            value={
              <span className={profile.emailVerified ? 'text-chart-1' : 'text-muted-foreground'}>
                {profile.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
              </span>
            }
          />

          <StatusRow
            delay="delay-[450ms]"
            label="Xác thực 2 lớp"
            icon={
              profile.isTwoFactorEnabled ? (
                <Shield className="text-primary size-3.5" />
              ) : (
                <ShieldOff className="text-muted-foreground size-3.5" />
              )
            }
            value={
              <span
                className={profile.isTwoFactorEnabled ? 'text-primary' : 'text-muted-foreground'}
              >
                {profile.isTwoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
              </span>
            }
          />
        </div>

        <div className="bg-border animate-in fade-in fill-mode-both h-px delay-500 duration-300" />

        {/* Last login */}
        <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex items-start gap-2 delay-500 duration-300">
          <Clock className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
          <div>
            <p className="text-muted-foreground text-[11px]">Đăng nhập lần cuối</p>
            <p className="text-foreground mt-0.5 text-xs font-medium">
              {formatLastLogin(profile.lastLoginAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
