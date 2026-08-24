export function formatInventoryQuantity(value: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)
}

export function formatInventoryDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
