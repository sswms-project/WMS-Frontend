const WAREHOUSE_STATUS_LABELS: Record<string, string> = {
  Active: 'Hoạt động',
  Inactive: 'Ngừng hoạt động',
  Blocked: 'Tạm khóa',
  Vacant: 'Còn trống',
  Occupied: 'Đang chứa hàng',
  Reserved: 'Đã giữ chỗ',
  Full: 'Đầy',
  Empty: 'Trống',
}

export function formatWarehouseStatus(status: string) {
  return WAREHOUSE_STATUS_LABELS[status] ?? status
}

export function formatCapacityLimit(capacity: number | null | undefined) {
  return capacity == null ? 'Không áp dụng' : Math.max(0, capacity).toLocaleString('vi-VN')
}
