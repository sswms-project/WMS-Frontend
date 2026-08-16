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

export type StaffLifecycleAction = 'deactivate' | 'reactivate'
