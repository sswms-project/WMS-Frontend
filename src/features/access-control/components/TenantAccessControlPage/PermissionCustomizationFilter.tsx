import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { PersonalPermissionFilter } from '../../types/tenant-access-control.types'
import { isPersonalPermissionFilter } from '../../utils/tenant-access-control'

interface PermissionCustomizationFilterProps {
  readonly value: PersonalPermissionFilter
  readonly onChange: (filter: PersonalPermissionFilter) => void
}

export function PermissionCustomizationFilter({
  value,
  onChange,
}: PermissionCustomizationFilterProps) {
  return (
    <>
      <div className="w-full sm:hidden">
        <label htmlFor="permission-customization-filter" className="sr-only">
          Lọc quyền cá nhân
        </label>
        <Select
          value={value}
          onValueChange={(next) => {
            if (isPersonalPermissionFilter(next)) onChange(next)
          }}
        >
          <SelectTrigger id="permission-customization-filter" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={4}>
            <SelectGroup>
              <SelectItem value="all">Tất cả quyền</SelectItem>
              <SelectItem value="customized">Đã tùy chỉnh</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        variant="outline"
        spacing={0}
        aria-label="Lọc quyền cá nhân"
        className="hidden sm:flex"
        onValueChange={(next) => {
          if (isPersonalPermissionFilter(next)) onChange(next)
        }}
      >
        <ToggleGroupItem value="all">Tất cả quyền</ToggleGroupItem>
        <ToggleGroupItem value="customized">Đã tùy chỉnh</ToggleGroupItem>
      </ToggleGroup>
    </>
  )
}
