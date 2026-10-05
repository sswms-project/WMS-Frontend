import { UserRoundX } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { FormerStaffResponse } from '../../../types/staff.types'
import { StaffEmploymentHistory } from '../StaffEmploymentHistory'

interface FormerStaffHistorySheetProps {
  readonly person: FormerStaffResponse | null
  readonly canEdit: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function FormerStaffHistorySheet({
  person,
  canEdit,
  onOpenChange,
}: FormerStaffHistorySheetProps) {
  return (
    <Sheet open={person !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Lịch sử làm việc</SheetTitle>
          <SheetDescription>Nhân sự đã chấm dứt làm việc tại tổ chức.</SheetDescription>
        </SheetHeader>
        {person && (
          <div>
            <div className="flex items-start gap-3 border-b p-4">
              <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center">
                <UserRoundX className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold">{person.fullName}</p>
                <p className="text-muted-foreground text-xs break-words">{person.email}</p>
              </div>
            </div>
            <StaffEmploymentHistory userId={person.userId} enabled canEdit={canEdit} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
