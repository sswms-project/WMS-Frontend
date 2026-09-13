export function getStaffStatusLabel(status: string) {
  const labels: Record<string, string> = {
    Active: 'Đang hoạt động',
    Inactive: 'Đã vô hiệu hóa',
    AccountInactive: 'Tài khoản bị vô hiệu hóa toàn hệ thống',
    Pending: 'Đang chờ',
    Locked: 'Đã khóa',
    Terminated: 'Đã chấm dứt làm việc',
  }
  return labels[status] ?? status
}
