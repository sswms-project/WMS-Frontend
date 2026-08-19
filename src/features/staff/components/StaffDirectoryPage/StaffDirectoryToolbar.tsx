import { Search, X } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

interface StaffDirectoryToolbarProps {
  readonly searchText: string
  readonly isFetching: boolean
  readonly onSearchChange: (value: string) => void
}

export function StaffDirectoryToolbar({
  searchText,
  isFetching,
  onSearchChange,
}: StaffDirectoryToolbarProps) {
  return (
    <div className="flex min-h-12 min-w-0 flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
      <InputGroup className="h-10 w-full sm:h-8 sm:max-w-sm">
        <InputGroupAddon>
          <Search className="size-4" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          value={searchText}
          aria-label="Tìm theo tên hoặc email"
          placeholder="Tìm theo tên hoặc email"
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {searchText && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Xóa nội dung tìm kiếm"
              onClick={() => onSearchChange('')}
            >
              <X className="size-3.5" aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <div
        className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs"
        aria-live="polite"
      >
        {isFetching && <span className="bg-primary size-1.5 animate-pulse" aria-hidden="true" />}
        {isFetching ? 'Đang cập nhật danh sách' : 'Danh sách đã cập nhật'}
      </div>
    </div>
  )
}
