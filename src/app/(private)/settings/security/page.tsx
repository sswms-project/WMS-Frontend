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
        </div>
      </div>
      <SecurityPage />
    </div>
  )
}
