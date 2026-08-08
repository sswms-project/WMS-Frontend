import type { StaffLifecycleAction } from '../types/staff.types'

export function getStaffLifecycleAction(status: string): StaffLifecycleAction | null {
  if (status === 'Active') return 'deactivate'
  if (status === 'Inactive') return 'reactivate'
  return null
}

export function getStaffStatusLabel(status: string) {
  const labels: Record<string, string> = {
    Active: 'Đang hoạt động',
    Inactive: 'Đã vô hiệu hóa',
    Pending: 'Đang chờ',
    Locked: 'Đã khóa',
  }
  return labels[status] ?? status
}
