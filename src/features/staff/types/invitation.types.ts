import type { QueryInfo } from '@/types/api'
import type { USER_ROLES } from '@/config/roles'

export type InvitableRole = typeof USER_ROLES.WarehouseManager | typeof USER_ROLES.WarehouseStaff

export interface SendInvitationRequest {
  fullName: string
  email: string
  role: InvitableRole
  warehouseIds: string[]
}

export interface InvitationWarehouseResponse {
  id: string
  warehouseCode: string
  warehouseName: string
}

export interface InvitationResponse {
  id: string
  fullName: string
  email: string
  role: InvitableRole
  warehouseId?: string | null
  warehouses: InvitationWarehouseResponse[]
  status: string
  effectiveStatus: string
  deliveryStatus: string
  createdAt: string
  expiresAt: string
  lastSentAt?: string | null
  canResend: boolean
  canRevoke: boolean
}

export type InvitationQuery = QueryInfo

export interface AcceptInvitationRequest {
  fullName?: string
  password: string
  confirmPassword: string
}

export interface InvitationPreviewResponse {
  fullName: string
  email: string
  tenantName: string
  role: InvitableRole
  warehouses: InvitationWarehouseResponse[]
  expiresAt: string
  effectiveStatus: string
  accountMode: 'NewAccount'
}

export interface PersonnelImportSummary {
  total: number
  valid: number
  invalid: number
  warning: number
}

export interface PersonnelImportIssue {
  code: string
  field: string
  message: string
}

export interface PersonnelImportRow {
  rowNumber: number
  fullName: string
  email: string
  roleCode: string
  warehouseCodes: string[]
  resolvedWarehouses: InvitationWarehouseResponse[]
  accountMode: 'NewAccount'
  status: 'Valid' | 'Invalid'
  errors: PersonnelImportIssue[]
  warnings: PersonnelImportIssue[]
}

export interface PersonnelImportPreview {
  importId: string
  rowVersion: string
  fileName: string
  expiresAt: string
  summary: PersonnelImportSummary
  rows: PersonnelImportRow[]
}

export interface PersonnelImportCommitRow {
  rowNumber: number
  invitationId: string
  email: string
  status: string
  deliveryStatus: string
  message: string
}

export interface PersonnelImportCommit {
  importId: string
  status: string
  createdCount: number
  skippedCount: number
  results: PersonnelImportCommitRow[]
}

export interface PersonnelImportDetails {
  preview: PersonnelImportPreview
  commit?: PersonnelImportCommit | null
}

export interface CommitPersonnelImportRequest {
  selectedRowNumbers: number[]
  rowVersion: string
}
