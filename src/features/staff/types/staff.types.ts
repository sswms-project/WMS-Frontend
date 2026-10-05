import type { QueryInfo } from '@/types/api'

export const STAFF_DIRECTORY_KINDS = {
  managers: 'managers',
  staff: 'staff',
} as const

export type StaffDirectoryKind = (typeof STAFF_DIRECTORY_KINDS)[keyof typeof STAFF_DIRECTORY_KINDS]

export interface StaffResponse {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: string | null
  status: string
  lastLoginAt: string | null
  assignedWarehouseIds: string[]
}

export interface StaffQuery extends QueryInfo {
  top: number
  skip: number
  needTotalCount: true
}

export interface StaffEmploymentPeriod {
  id: string
  userId: string
  startDate: string
  endDate: string | null
  isCurrent: boolean
  isEndDateUnknown: boolean
  isCurrentAccount: boolean
}

export interface StaffEmploymentHistory {
  periods: StaffEmploymentPeriod[]
}

export interface UpdateStaffEmploymentPeriodRequest {
  startDate: string
  endDate: string | null
}

export interface UpdateStaffEmploymentPeriodVariables {
  userId: string
  periodId: string
  request: UpdateStaffEmploymentPeriodRequest
}

export interface FormerStaffResponse {
  userId: string
  fullName: string
  email: string
  role: string | null
  periodCount: number
  firstStartDate: string | null
  lastEndDate: string | null
}
