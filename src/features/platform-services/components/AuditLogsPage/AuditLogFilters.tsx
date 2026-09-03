import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuditLogFilterValues } from './types'

interface AuditLogFiltersProps {
  readonly filters: AuditLogFilterValues
  readonly onApply: (filters: AuditLogFilterValues) => void
  readonly onClear: () => void
}

export function AuditLogFilters({ filters, onApply, onClear }: AuditLogFiltersProps) {
  return (
    <form
      key={JSON.stringify(filters)}
      className="bg-card grid gap-3 rounded-md border p-3 sm:grid-cols-2 xl:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onApply({
          search: String(data.get('search') ?? ''),
          action: String(data.get('action') ?? ''),
          entityType: String(data.get('entityType') ?? ''),
          entityId: String(data.get('entityId') ?? ''),
          userId: String(data.get('userId') ?? ''),
          dateFrom: String(data.get('dateFrom') ?? ''),
          dateTo: String(data.get('dateTo') ?? ''),
        })
      }}
    >
      <FilterInput
        id="audit-search"
        name="search"
        label="Tìm kiếm"
        value={filters.search}
        placeholder="Ví dụ: phê duyệt đơn mua…"
      />
      <FilterInput
        id="audit-action"
        name="action"
        label="Hành động"
        value={filters.action}
        placeholder="Ví dụ: ApprovePurchaseOrder…"
      />
      <FilterInput
        id="audit-entity-type"
        name="entityType"
        label="Loại đối tượng"
        value={filters.entityType}
        placeholder="Ví dụ: PurchaseOrder…"
      />
      <FilterInput
        id="audit-user-id"
        name="userId"
        label="Actor ID"
        value={filters.userId}
        placeholder="UUID người thực hiện…"
      />
      <FilterInput
        id="audit-entity-id"
        name="entityId"
        label="Entity ID"
        value={filters.entityId}
        placeholder="UUID đối tượng…"
      />
      <FilterInput
        id="audit-from"
        name="dateFrom"
        label="Từ ngày"
        value={filters.dateFrom}
        type="date"
      />
      <FilterInput
        id="audit-to"
        name="dateTo"
        label="Đến ngày"
        value={filters.dateTo}
        type="date"
      />
      <div className="flex items-end gap-2">
        <Button type="submit">
          <Search data-icon="inline-start" aria-hidden="true" />
          Áp dụng
        </Button>
        <Button type="button" variant="ghost" onClick={onClear}>
          Xóa lọc
        </Button>
      </div>
    </form>
  )
}

interface FilterInputProps {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly value: string
  readonly placeholder?: string
  readonly type?: string
}

function FilterInput({ id, name, label, value, placeholder, type = 'text' }: FilterInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  )
}
