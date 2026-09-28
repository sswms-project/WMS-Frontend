import { ShieldCheck, UserRoundCog } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AccessControlMode } from '../../types/tenant-access-control.types'
import { isAccessControlMode } from '../../utils/tenant-access-control'

interface AccessControlModeTabsProps {
  readonly value: AccessControlMode
  readonly disabled?: boolean
  readonly onChange: (mode: AccessControlMode) => void
}

export function AccessControlModeTabs({ value, disabled, onChange }: AccessControlModeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        if (isAccessControlMode(nextValue)) onChange(nextValue)
      }}
    >
      <header className="border-border flex shrink-0 flex-wrap items-center gap-3 border-b pb-3">
        <div className="flex shrink-0 items-center gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <ShieldCheck aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-balance">Phân quyền</h1>
        </div>

        <TabsList variant="workspace" aria-label="Chế độ phân quyền" className="h-9 p-0">
          <TabsTrigger value="role" disabled={disabled} className="h-9 flex-none gap-2 px-3">
            <ShieldCheck aria-hidden="true" />
            Theo vai trò
          </TabsTrigger>
          <TabsTrigger value="personal" disabled={disabled} className="h-9 flex-none gap-2 px-3">
            <UserRoundCog aria-hidden="true" />
            Theo nhân sự
          </TabsTrigger>
        </TabsList>
      </header>
    </Tabs>
  )
}
