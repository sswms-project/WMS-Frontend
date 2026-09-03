import { Search } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

interface PermissionSearchProps {
  readonly value: string
  readonly onChange: (value: string) => void
}

export function PermissionSearch({ value, onChange }: PermissionSearchProps) {
  return (
    <div className="w-full sm:max-w-sm sm:flex-1">
      <label htmlFor="permission-search" className="sr-only">
        Tìm quyền
      </label>
      <InputGroup className="h-9">
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id="permission-search"
          name="permission-search"
          type="search"
          value={value}
          placeholder="Tìm theo phân hệ, quyền hoặc từ khóa…"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
    </div>
  )
}
