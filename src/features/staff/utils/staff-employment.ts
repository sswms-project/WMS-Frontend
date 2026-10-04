import type { StaffEmploymentPeriod } from '../types/staff.types'

export function formatEmploymentDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export function getEmploymentPeriodLabel(period: StaffEmploymentPeriod) {
  const start = formatEmploymentDate(period.startDate)
  if (period.endDate) return `${start} – ${formatEmploymentDate(period.endDate)}`
  if (period.isCurrent) return `${start} – nay`
  return `${start} – chưa rõ`
}

export function canEditEmploymentEndDate(period: StaffEmploymentPeriod) {
  return !period.isCurrent
}
