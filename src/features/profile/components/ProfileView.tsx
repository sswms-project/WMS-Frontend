import type { ComponentType, ReactNode } from 'react'
import { CheckCircle2, Mail, Pencil, Phone, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { UserProfileResponse } from '@/features/auth/types/auth.types'
import { SectionIconBadge } from '@/features/settings/components/SecurityPage'

interface ProfileViewProps {
  readonly profile: UserProfileResponse
  readonly onEdit: () => void
}

interface InfoRowProps {
  readonly icon: ComponentType<{ className?: string }>
  readonly label: string
  readonly value: string | null | undefined
  readonly suffix?: ReactNode
}

function InfoRow({ icon: Icon, label, value, suffix }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11.5px] font-medium tracking-wide uppercase">
          {label}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-foreground text-sm font-medium break-words">
            {value || 'Chưa cập nhật'}
          </p>
          {suffix}
        </div>
      </div>
    </div>
  )
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <Card className="animate-in fade-in slide-in-from-right-4 gap-0 py-0 duration-400">
      <CardHeader className="flex flex-row items-center gap-2.5 border-b px-6 pt-5 pb-4">
        <SectionIconBadge icon={Mail} />
        <div>
          <CardTitle className="text-[14.5px] font-bold">Thông tin liên hệ</CardTitle>
          <CardDescription className="text-[12.5px]">
            Email và số điện thoại được dùng để liên lạc và thông báo
          </CardDescription>
        </div>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1.5 px-3 text-[12.5px] transition-all hover:shadow-sm active:scale-[0.97]"
            onClick={onEdit}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Chỉnh sửa
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="px-6 py-1">
        <div className="divide-y">
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-75 duration-300">
            <InfoRow
              icon={Mail}
              label="Email"
              value={profile.email}
              suffix={
                profile.emailVerified ? (
                  <span className="text-chart-1 flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 className="size-3.5" />
                    Đã xác thực
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <XCircle className="size-3.5" />
                    Chưa xác thực
                  </span>
                )
              }
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-150 duration-300">
            <InfoRow icon={Phone} label="Số điện thoại" value={profile.phone} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
