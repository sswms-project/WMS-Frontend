import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NotificationType } from '../../types/platform-services.types'
import type { NotificationFilterValues } from './types'

const TYPE_LABELS: Record<NotificationType, string> = {
  LowStock: 'Tồn kho thấp',
  TaskAssigned: 'Nhiệm vụ',
  DeliveryUpdate: 'Giao hàng',
  POUpdate: 'Đơn mua',
  TenantStatusUpdate: 'Trạng thái tenant',
  SubscriptionPlanUpdate: 'Gói đăng ký',
  SubscriptionPaymentUpdate: 'Thanh toán gói',
  InboundUpdate: 'Nhập kho',
  StockAdjustmentUpdate: 'Điều chỉnh tồn',
  TransferUpdate: 'Điều chuyển kho',
  OutboundUpdate: 'Xuất kho',
  ReturnUpdate: 'Hoàn hàng',
  CycleCountUpdate: 'Kiểm kê',
  WarehouseUpdate: 'Kho hàng',
}

interface NotificationFiltersProps {
  readonly filters: NotificationFilterValues
  readonly onApply: (filters: NotificationFilterValues) => void
  readonly onClear: () => void
}

export function NotificationFilters({ filters, onApply, onClear }: NotificationFiltersProps) {
  return (
    <form
      key={JSON.stringify(filters)}
      className="bg-card grid gap-3 rounded-md border p-3 sm:grid-cols-2 xl:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onApply({
          search: String(data.get('search') ?? ''),
          type: String(data.get('type') ?? ''),
          readState: String(data.get('readState') ?? 'all'),
          dateFrom: String(data.get('dateFrom') ?? ''),
          dateTo: String(data.get('dateTo') ?? ''),
        })
      }}
    >
      <div className="space-y-1 sm:col-span-2 xl:col-span-2">
        <Label htmlFor="notification-search">Tìm kiếm</Label>
        <Input
          id="notification-search"
          name="search"
          defaultValue={filters.search}
          placeholder="Ví dụ: giao hàng thất bại…"
          autoComplete="off"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-type">Loại</Label>
        <Select name="type" defaultValue={filters.type || 'all'}>
          <SelectTrigger id="notification-type" className="w-full">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent align="start" sideOffset={4}>
            <SelectGroup>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-read-state">Trạng thái</Label>
        <Select name="readState" defaultValue={filters.readState}>
          <SelectTrigger id="notification-read-state" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" sideOffset={4}>
            <SelectGroup>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="unread">Chưa đọc</SelectItem>
              <SelectItem value="read">Đã đọc</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-from">Từ ngày</Label>
        <Input id="notification-from" name="dateFrom" type="date" defaultValue={filters.dateFrom} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notification-to">Đến ngày</Label>
        <Input id="notification-to" name="dateTo" type="date" defaultValue={filters.dateTo} />
      </div>
      <div className="flex gap-2 sm:col-span-2 xl:col-span-6">
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

export { TYPE_LABELS }
