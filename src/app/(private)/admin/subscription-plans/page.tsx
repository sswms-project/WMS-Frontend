import { CreditCard } from 'lucide-react'
import { SubscriptionPlansPage } from '@/features/admin/pages'

export default function AdminSubscriptionPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="text-primary size-6" aria-hidden="true" />
        <div>
          <h2 className="text-foreground text-xl font-semibold">Gói đăng ký</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý các gói đăng ký mà tenant có thể lựa chọn
          </p>
        </div>
      </div>
      <SubscriptionPlansPage />
    </div>
  )
}
