import { Check, Info, ShieldCheck, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TenantRolePolicy } from '../../types/tenant-access-control.types'
import { getTenantRoleContent } from '../../utils/tenant-access-control'

interface RoleSelectorProps {
  roles: TenantRolePolicy[]
  selectedRoleId: string
  disabled?: boolean
  onSelect: (roleId: string) => void
}

export function RoleSelector({ roles, selectedRoleId, disabled, onSelect }: RoleSelectorProps) {
  return (
    <>
      <div className="border-border bg-card border-b p-3 md:hidden">
        <label
          htmlFor="tenant-role-select"
          className="text-foreground mb-1.5 block text-xs font-medium"
        >
          Vai trò cần cấu hình
        </label>
        <Select value={selectedRoleId} onValueChange={onSelect} disabled={disabled}>
          <SelectTrigger id="tenant-role-select" className="h-10 w-full">
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent align="start" sideOffset={4}>
            {roles.map((role) => (
              <SelectItem key={role.roleId} value={role.roleId}>
                {getTenantRoleContent(role.roleName).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground mt-2 text-xs leading-5">
          Chỉ Chủ doanh nghiệp có thể thay đổi quyền trong tenant.
        </p>
      </div>

      <aside className="border-border bg-muted/20 hidden min-h-0 w-[18rem] shrink-0 border-r md:flex md:flex-col">
        <div className="border-border border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground size-4" aria-hidden="true" />
            <h2 className="text-foreground text-sm font-semibold">Vai trò</h2>
          </div>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            Chọn vai trò để xem và chỉnh sửa quyền.
          </p>
        </div>
        <nav aria-label="Vai trò có thể phân quyền" className="flex flex-col gap-2 p-3">
          {roles.map((role) => {
            const active = role.roleId === selectedRoleId
            const content = getTenantRoleContent(role.roleName)
            return (
              <Button
                key={role.roleId}
                type="button"
                variant="ghost"
                disabled={disabled}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(role.roleId)}
                className={cn(
                  'h-auto w-full justify-start gap-3 rounded-md border px-3 py-3.5 text-left whitespace-normal',
                  active
                    ? 'border-primary/40 bg-primary/10 hover:bg-primary/10'
                    : 'hover:border-border hover:bg-card border-transparent'
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-md border',
                    active
                      ? 'border-primary/30 bg-primary text-primary-foreground'
                      : 'border-border'
                  )}
                >
                  {active ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm font-medium">{content.label}</span>
                  <span className="text-muted-foreground mt-1 block text-[11px] leading-4">
                    {content.description}
                  </span>
                  <span className="text-muted-foreground mt-2 block text-[11px] tabular-nums">
                    {role.directPermissionIds.length} trực tiếp ·{' '}
                    {role.effectivePermissionIds.length} hiệu lực
                  </span>
                </span>
                <Badge variant={active ? 'default' : 'outline'} className="self-start tabular-nums">
                  {role.effectivePermissionIds.length}
                </Badge>
              </Button>
            )
          })}
        </nav>
        <div className="mt-auto p-3">
          <Alert className="bg-primary/5 border-primary/20">
            <Info aria-hidden="true" />
            <AlertTitle>Phạm vi quản lý</AlertTitle>
            <AlertDescription>
              Chỉ Chủ doanh nghiệp được thay đổi quyền. Quyền hệ thống và quản trị nền tảng không
              được ủy quyền.
            </AlertDescription>
          </Alert>
        </div>
      </aside>
    </>
  )
}
