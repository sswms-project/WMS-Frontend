import { Building2, Mail, MapPin, Pencil, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { OrganizationResponse } from '../../types/organization.types'

interface OrganizationProfileViewProps {
  readonly organization: OrganizationResponse
  readonly onEdit: () => void
}

const details = [
  { key: 'email', label: 'Email tổ chức', icon: Mail },
  { key: 'phone', label: 'Số điện thoại', icon: Phone },
  { key: 'address', label: 'Địa chỉ', icon: MapPin },
] as const

export function OrganizationProfileView({ organization, onEdit }: OrganizationProfileViewProps) {
  return (
    <section className="bg-card border" aria-labelledby="organization-profile-title">
      <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center">
            <Building2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="organization-profile-title" className="truncate text-base font-semibold">
                {organization.tenantName}
              </h2>
              <Badge variant="outline">{organization.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Mã tổ chức: {organization.id}</p>
          </div>
        </div>
        <Button type="button" variant="outline" className="h-10 gap-2 sm:h-8" onClick={onEdit}>
          <Pencil className="size-3.5" aria-hidden="true" />
          Chỉnh sửa
        </Button>
      </div>

      <dl className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
        {details.map(({ key, label, icon: Icon }, index) => (
          <div
            key={key}
            className={
              index === 2
                ? 'flex gap-3 px-4 py-4 md:col-span-2 md:border-t'
                : 'flex gap-3 px-4 py-4'
            }
          >
            <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs">{label}</dt>
              <dd className="mt-1 text-sm font-medium break-words">
                {organization[key] || 'Chưa cập nhật'}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
