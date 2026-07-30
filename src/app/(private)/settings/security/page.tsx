import { ShieldCheck } from 'lucide-react'
import { SecurityPage } from '@/features/settings/pages'
import { SectionIconBadge } from '@/features/settings/components/SecurityPage'

export default function SettingsSecurityPage() {
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3.5">
        <SectionIconBadge icon={ShieldCheck} tone="primary" size="lg" />
        <div>
          <h2 className="text-foreground text-[22px] font-bold">Mật khẩu và bảo mật</h2>
          <p className="text-muted-foreground mt-0.5 text-[13.5px]">
            Quản lý mật khẩu và xác thực hai yếu tố cho tài khoản của bạn
          </p>
        </div>
      </div>
      <SecurityPage />
    </div>
  )
}
