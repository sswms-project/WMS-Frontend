import { Building2, CircleCheck, Mail, MapPin, Pencil, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { OrganizationResponse } from '../../types/organization.types'

interface OrganizationProfileViewProps {
  readonly organization: OrganizationResponse
  readonly onEdit: () => void
}
function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="bg-background flex gap-3 border p-4">
      <Icon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="mt-1 text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

export function OrganizationProfileView({ organization, onEdit }: OrganizationProfileViewProps) {
  const address = organization.address || 'Chưa cập nhật — thêm địa chỉ để hoàn thiện hồ sơ.'
  return (
    <section className="space-y-4" aria-labelledby="organization-profile-title">
      <div className="bg-card border">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center">
              <Building2 className="size-7" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="organization-profile-title" className="truncate text-lg font-semibold">
                  {organization.tenantName}
                </h2>
                <Badge className="gap-1">
                  <CircleCheck className="size-3" aria-hidden="true" />
                  {organization.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Không gian vận hành kho của tổ chức
              </p>
              <p className="text-muted-foreground mt-2 font-mono text-xs">
                Mã tổ chức · {organization.id}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={onEdit}>
            <Pencil className="size-4" aria-hidden="true" />
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <section className="bg-card border p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Thông tin liên hệ</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Thông tin dùng cho trao đổi vận hành và nhận diện tổ chức.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailCard icon={Mail} label="Email tổ chức" value={organization.email} />
            <DetailCard
              icon={Phone}
              label="Số điện thoại"
              value={organization.phone || 'Chưa cập nhật'}
            />
            <div className="sm:col-span-2">
              <DetailCard icon={MapPin} label="Địa chỉ" value={address} />
            </div>
          </div>
        </section>
        <section className="bg-card border p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Vận hành & quản trị</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Thiết lập nền tảng của không gian tenant.
            </p>
          </div>
          <DetailCard
            icon={CircleCheck}
            label="Trạng thái tổ chức"
            value={organization.status === 'Active' ? 'Đang hoạt động' : organization.status}
          />
        </section>
      </div>
    </section>
  )
}
