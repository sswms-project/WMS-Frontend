import { ShieldCheck, UserRoundCog } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { AccessControlMode } from '../../types/tenant-access-control.types'
import { isAccessControlMode } from '../../utils/tenant-access-control'

interface AccessControlModeTabsProps {
  readonly value: AccessControlMode
  readonly disabled?: boolean
  readonly onChange: (mode: AccessControlMode) => void
}

export function AccessControlModeTabs({ value, disabled, onChange }: AccessControlModeTabsProps) {
  const roleModeActive = value === 'role'
  const personalModeActive = value === 'personal'

  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        if (isAccessControlMode(nextValue)) onChange(nextValue)
      }}
    >
      <TabsList
        aria-label="Chế độ phân quyền"
        className="grid h-auto w-full max-w-xl grid-cols-2 gap-1 rounded-lg border p-1 group-data-[orientation=horizontal]/tabs:h-auto"
      >
        <TabsTrigger
          value="role"
          aria-label="Vai trò"
          disabled={disabled}
          className={cn(
            'min-h-14 justify-start gap-3 rounded-md border border-transparent px-3 py-2 text-left transition-[background-color,border-color,box-shadow,color] after:hidden',
            roleModeActive
              ? 'border-primary/30 bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
          )}
        >
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-sm border',
              roleModeActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            <ShieldCheck aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold">Vai trò</span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              Quyền mặc định theo nhóm
            </span>
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="personal"
          aria-label="Quyền cá nhân"
          disabled={disabled}
          className={cn(
            'min-h-14 justify-start gap-3 rounded-md border border-transparent px-3 py-2 text-left transition-[background-color,border-color,box-shadow,color] after:hidden',
            personalModeActive
              ? 'border-primary/30 bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
          )}
        >
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-sm border',
              personalModeActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            <UserRoundCog aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold">Quyền cá nhân</span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              Tùy chỉnh cho từng người
            </span>
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
