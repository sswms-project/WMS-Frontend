'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  PersonalPermissionFilter,
  TenantAssignablePermission,
  TenantUserPermissionWorkspace,
} from '../../../types/tenant-access-control.types'
import {
  arePermissionSetsEqual,
  filterPermissionGroups,
  filterPermissionGroupsByIds,
  getCustomizedPermissionIds,
  groupTenantPermissions,
} from '../../../utils/tenant-access-control'
import {
  getPersonalPermissionErrorDetails,
  type PersonalPermissionRecovery,
} from '../../../utils/tenant-user-permission-error'

interface PersonalPermissionEditorStateOptions {
  readonly permissions: TenantAssignablePermission[]
  readonly workspace?: TenantUserPermissionWorkspace
  readonly saving: boolean
  readonly resetting: boolean
  readonly onSubjectChange: (userId: string) => void
  readonly onRetryWorkspace: () => Promise<TenantUserPermissionWorkspace | undefined>
  readonly onSave: (
    userId: string,
    expectedRoleId: string,
    permissionIds: string[]
  ) => Promise<void>
  readonly onReset: (userId: string, expectedRoleId: string) => Promise<void>
}

export function usePersonalPermissionEditorState({
  permissions,
  workspace,
  saving,
  resetting,
  onSubjectChange,
  onRetryWorkspace,
  onSave,
  onReset,
}: PersonalPermissionEditorStateOptions) {
  const initialEffectiveIds = workspace?.effectivePermissionIds ?? []
  const [baselineIds, setBaselineIds] = useState<Set<string>>(() => new Set(initialEffectiveIds))
  const [draftIds, setDraftIds] = useState<Set<string>>(() => new Set(initialEffectiveIds))
  const [permissionSearch, setPermissionSearch] = useState('')
  const [filter, setFilter] = useState<PersonalPermissionFilter>('all')
  const [openModules, setOpenModules] = useState<string[]>([])
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [recovery, setRecovery] = useState<PersonalPermissionRecovery | null>(null)

  const roleDefaultIds = useMemo(
    () => new Set(workspace?.roleDefaultPermissionIds ?? []),
    [workspace?.roleDefaultPermissionIds]
  )
  const customizedIds = useMemo(
    () => getCustomizedPermissionIds(draftIds, roleDefaultIds),
    [draftIds, roleDefaultIds]
  )
  const unsavedChangeCount = useMemo(
    () => getCustomizedPermissionIds(draftIds, baselineIds).size,
    [baselineIds, draftIds]
  )
  const groupedPermissions = useMemo(() => groupTenantPermissions(permissions), [permissions])
  const searchedGroups = useMemo(
    () => filterPermissionGroups(groupedPermissions, permissionSearch),
    [groupedPermissions, permissionSearch]
  )
  const filteredGroups = useMemo(
    () =>
      filter === 'customized'
        ? filterPermissionGroupsByIds(searchedGroups, customizedIds)
        : searchedGroups,
    [customizedIds, filter, searchedGroups]
  )
  const isDirty = Boolean(workspace) && !arePermissionSetsEqual(draftIds, baselineIds)
  const busy = saving || resetting
  const editorBlocked = busy || recovery !== null
  const visibleOpenModules = permissionSearch.trim()
    ? filteredGroups.map((group) => group.module)
    : openModules

  useEffect(() => {
    // A successful mutation invalidates and refetches this workspace before mutateAsync resolves.
    // Ignore that expected response while the local save/reset is still settling; saveDraft and
    // resetPermissions establish the matching baseline immediately after the mutation completes.
    if (!workspace || busy) return
    const authoritativeIds = new Set(workspace.effectivePermissionIds)
    if (isDirty) {
      if (arePermissionSetsEqual(authoritativeIds, baselineIds) || recovery) return
      queueMicrotask(() => {
        setMutationError(
          'Dữ liệu quyền trên máy chủ đã thay đổi. Hãy đối chiếu bản chỉnh sửa rồi tải dữ liệu mới.'
        )
        setRecovery('reload')
      })
      return
    }
    if (arePermissionSetsEqual(authoritativeIds, baselineIds)) return
    queueMicrotask(() => {
      setBaselineIds(authoritativeIds)
      setDraftIds(new Set(authoritativeIds))
      setMutationError(null)
      setRecovery(null)
    })
  }, [baselineIds, busy, isDirty, recovery, workspace])

  function togglePermission(permissionId: string) {
    setMutationError(null)
    setDraftIds((current) => {
      const next = new Set(current)
      if (next.has(permissionId)) next.delete(permissionId)
      else next.add(permissionId)
      return next
    })
  }

  function toggleModule(permissionIds: string[]) {
    setMutationError(null)
    setDraftIds((current) => {
      const next = new Set(current)
      const allSelected = permissionIds.every((permissionId) => next.has(permissionId))
      for (const permissionId of permissionIds) {
        if (allSelected) next.delete(permissionId)
        else next.add(permissionId)
      }
      return next
    })
  }

  async function saveDraft() {
    if (!workspace || !isDirty || editorBlocked) return !isDirty
    try {
      await onSave(workspace.subject.userId, workspace.subject.roleId, [...draftIds].sort())
      setBaselineIds(new Set(draftIds))
      setMutationError(null)
      setRecovery(null)
      return true
    } catch (error) {
      const details = getPersonalPermissionErrorDetails(error)
      if (details.targetUnavailable) {
        onSubjectChange('')
        return false
      }
      setMutationError(details.message)
      setRecovery(details.recovery ?? null)
      return false
    }
  }

  async function resetPermissions() {
    if (!workspace || busy) return
    try {
      await onReset(workspace.subject.userId, workspace.subject.roleId)
      setBaselineIds(new Set(roleDefaultIds))
      setDraftIds(new Set(roleDefaultIds))
      setMutationError(null)
      setRecovery(null)
      setResetDialogOpen(false)
    } catch (error) {
      const details = getPersonalPermissionErrorDetails(error)
      if (details.targetUnavailable) {
        setResetDialogOpen(false)
        onSubjectChange('')
        return
      }
      setMutationError(details.message)
      setRecovery(details.recovery ?? null)
      setResetDialogOpen(false)
    }
  }

  async function reloadWorkspace() {
    const refreshedWorkspace = await onRetryWorkspace()
    if (!refreshedWorkspace) return
    const refreshedIds = new Set(refreshedWorkspace.effectivePermissionIds)
    setBaselineIds(refreshedIds)
    setDraftIds(new Set(refreshedIds))
    setMutationError(null)
    setRecovery(null)
  }

  function reselectSubject() {
    setMutationError(null)
    setRecovery(null)
    onSubjectChange('')
  }

  function discardDraft() {
    setDraftIds(new Set(baselineIds))
    setMutationError(null)
  }

  function changeOpenModules(modules: string[]) {
    if (!permissionSearch.trim()) setOpenModules(modules)
  }

  return {
    busy,
    customizedIds,
    discardDraft,
    draftIds,
    editorBlocked,
    filter,
    filteredGroups,
    isDirty,
    mutationError,
    permissionSearch,
    recovery,
    reloadWorkspace,
    reselectSubject,
    resetDialogOpen,
    resetPermissions,
    roleDefaultIds,
    saveDraft,
    setFilter,
    setPermissionSearch,
    setResetDialogOpen,
    toggleModule,
    togglePermission,
    unsavedChangeCount,
    visibleOpenModules,
    changeOpenModules,
  }
}
