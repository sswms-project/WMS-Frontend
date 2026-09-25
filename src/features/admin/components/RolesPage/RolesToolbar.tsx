import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type RoleFilter = 'all' | 'system' | 'custom'

interface RolesToolbarProps {
  readonly search: string
  readonly filter: RoleFilter
  readonly count: number
  readonly isLoading: boolean
  readonly onSearchChange: (value: string) => void
  readonly onFilterChange: (value: RoleFilter) => void
}

export function RolesToolbar({
  search,
  filter,
  count,
  isLoading,
  onSearchChange,
  onFilterChange,
}: RolesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-xs">
        {isLoading ? (
          <Skeleton className="bg-muted/70 inline-block h-3.5 w-28 align-middle" />
        ) : (
          `${count} vai trò trong hệ thống`
        )}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm vai trò..."
            aria-label="Tìm vai trò"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Select value={filter} onValueChange={(value) => onFilterChange(value as RoleFilter)}>
          <SelectTrigger
            className="h-8 w-full cursor-pointer text-xs sm:w-36"
            aria-label="Lọc vai trò"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" position="popper" sideOffset={4}>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="system">Vai trò hệ thống</SelectItem>
            <SelectItem value="custom">Vai trò tùy chỉnh</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
