import { Check, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { TenantRolePolicy } from '../../types/tenant-access-control.types'
import { getTenantRoleContent } from '../../utils/tenant-access-control'

interface RoleSelectorProps {
  readonly roles: TenantRolePolicy[]
  readonly selectedRoleId: string
  readonly disabled?: boolean
  readonly onSelect: (roleId: string) => void
}

export function RoleSelector({ roles, selectedRoleId, disabled, onSelect }: RoleSelectorProps) {
  return (
    <div className="shrink-0">
      <div className="md:hidden">
        <label
          htmlFor="tenant-role-select"
          className="text-foreground mb-1.5 block text-xs font-medium"
        >
          Vai trò cần cấu hình
        </label>
        <Select value={selectedRoleId} onValueChange={onSelect} disabled={disabled}>
          <SelectTrigger id="tenant-role-select" className="bg-card h-10 w-full">
            <SelectValue placeholder="Chọn vai trò…" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={4}>
            <SelectGroup>
              {roles.map((role) => (
                <SelectItem key={role.roleId} value={role.roleId}>
                  {getTenantRoleContent(role.roleName).label} · {role.effectivePermissionIds.length}{' '}
                  quyền
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <nav
        aria-label="Vai trò có thể phân quyền"
        className="hidden min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain md:block"
      >
        <TabsList
          aria-label="Chọn vai trò cần cấu hình"
          className="h-12 w-max min-w-full items-stretch justify-start gap-2 bg-transparent p-0"
        >
          {roles.map((role) => {
            const active = role.roleId === selectedRoleId
            const content = getTenantRoleContent(role.roleName)

            return (
              <TabsTrigger
                key={role.roleId}
                value={role.roleId}
                disabled={disabled}
                className={cn(
                  'h-full min-w-56 flex-none justify-start gap-2.5 self-stretch rounded-md border-0 px-3 text-left ring-1 transition-[background-color,box-shadow,color] ring-inset after:hidden',
                  active
                    ? 'bg-primary/10 text-foreground ring-primary/50 hover:bg-primary/10'
                    : 'bg-card text-foreground ring-border hover:bg-primary/5 hover:ring-primary/40'
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-sm border',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {active ? <Check aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {content.label}
                </span>
                <Badge variant={active ? 'default' : 'outline'} className="shrink-0 tabular-nums">
                  {role.effectivePermissionIds.length}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </nav>
    </div>
  )
}
