'use client'

import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ApiErrorResponse } from '@/types/api'
import type {
  TenantRolePermissionWorkspace,
  TenantRolePolicy,
} from '../../types/tenant-access-control.types'
import {
  arePermissionSetsEqual,
  filterPermissionGroups,
  getRoleById,
  getTenantRoleContent,
  groupTenantPermissions,
} from '../../utils/tenant-access-control'
import { PermissionCatalog } from './PermissionCatalog'
import { PermissionEditorHeader } from './PermissionEditorHeader'
import { RoleSelector } from './RoleSelector'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

type PendingIntent =
  | { type: 'role'; roleId: string }
  | { type: 'navigation'; href: string }
  | { type: 'history' }

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

function getMutationMessage(error: unknown) {
  if (!isApiErrorResponse(error)) {
    return 'Không thể lưu thay đổi. Dữ liệu đang chỉnh vẫn được giữ lại.'
  }
  if (error.statusCode === 403) {
    return 'Quyền thao tác của bạn đã thay đổi. Hãy tải lại cấu hình trước khi thử lại.'
  }
  if (error.statusCode === 404 || error.statusCode === 409) {
    return 'Cấu hình quyền đã thay đổi ở nơi khác. Hãy tải lại và kiểm tra trước khi lưu.'
  }
  return error.message || 'Không thể lưu thay đổi. Dữ liệu đang chỉnh vẫn được giữ lại.'
}

interface AccessControlWorkspaceProps {
  workspace: TenantRolePermissionWorkspace
  saving: boolean
  onSave: (roleId: string, permissionIds: string[]) => Promise<void>
}

export function AccessControlWorkspace({ workspace, saving, onSave }: AccessControlWorkspaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const historyTraversal = useRef<'idle' | 'restoring' | 'leaving'>('idle')
  const firstRole = workspace.roles[0]!
  const [selectedRoleId, setSelectedRoleId] = useState(firstRole.roleId)
  const [baselineIds, setBaselineIds] = useState<Set<string>>(
    () => new Set(firstRole.directPermissionIds)
  )
  const [draftIds, setDraftIds] = useState<Set<string>>(
    () => new Set(firstRole.directPermissionIds)
  )
  const [searchText, setSearchText] = useState('')
  const [openModules, setOpenModules] = useState<string[]>([])
  const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const selectedRole = getRoleById(workspace.roles, selectedRoleId) ?? firstRole
  const roleContent = getTenantRoleContent(selectedRole.roleName)
  const inheritedIds = useMemo(
    () => new Set(selectedRole.inheritedPermissionIds),
    [selectedRole.inheritedPermissionIds]
  )
  const permissionGroups = useMemo(
    () => groupTenantPermissions(workspace.permissions),
    [workspace.permissions]
  )
  const filteredGroups = useMemo(
    () => filterPermissionGroups(permissionGroups, searchText),
    [permissionGroups, searchText]
  )
  const isDirty = !arePermissionSetsEqual(draftIds, baselineIds)
  const visibleOpenModules = searchText.trim()
    ? filteredGroups.map((group) => group.module)
    : openModules
  const effectiveCount = new Set([...draftIds, ...inheritedIds]).size

  useEffect(() => {
    if (getRoleById(workspace.roles, selectedRoleId)) return

    queueMicrotask(() => {
      setSelectedRoleId(firstRole.roleId)
      setBaselineIds(new Set(firstRole.directPermissionIds))
      setDraftIds(new Set(firstRole.directPermissionIds))
    })
  }, [firstRole, selectedRoleId, workspace.roles])

  useEffect(() => {
    const authoritativeIds = new Set(selectedRole.directPermissionIds)
    if (isDirty || arePermissionSetsEqual(authoritativeIds, baselineIds)) return

    queueMicrotask(() => {
      setBaselineIds(authoritativeIds)
      setDraftIds(new Set(authoritativeIds))
    })
  }, [baselineIds, isDirty, selectedRole.directPermissionIds])

  useEffect(() => {
    if (!isDirty) return

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const interceptNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank' || anchor.download)
        return

      const url = new URL(anchor.href, window.location.href)
      const href = `${url.pathname}${url.search}${url.hash}`
      if (url.origin !== window.location.origin || href === pathname) return

      event.preventDefault()
      event.stopPropagation()
      setPendingIntent({ type: 'navigation', href })
      setDialogOpen(true)
    }
    const interceptHistoryNavigation = () => {
      if (historyTraversal.current !== 'idle') {
        historyTraversal.current = 'idle'
        return
      }

      historyTraversal.current = 'restoring'
      window.history.forward()
      setPendingIntent({ type: 'history' })
      setDialogOpen(true)
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    window.addEventListener('popstate', interceptHistoryNavigation)
    document.addEventListener('click', interceptNavigation, true)
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload)
      window.removeEventListener('popstate', interceptHistoryNavigation)
      document.removeEventListener('click', interceptNavigation, true)
    }
  }, [isDirty, pathname])

  function selectRole(role: TenantRolePolicy) {
    setSelectedRoleId(role.roleId)
    setBaselineIds(new Set(role.directPermissionIds))
    setDraftIds(new Set(role.directPermissionIds))
    setMutationError(null)
    setSearchText('')
    setOpenModules([])
  }

  function requestRoleChange(roleId: string) {
    if (roleId === selectedRole.roleId || saving) return
    const nextRole = getRoleById(workspace.roles, roleId)
    if (!nextRole) return

    if (!isDirty) {
      selectRole(nextRole)
      return
    }

    setPendingIntent({ type: 'role', roleId })
    setDialogOpen(true)
  }

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
    if (!isDirty || saving) return !isDirty

    try {
      await onSave(selectedRole.roleId, [...draftIds])
      setBaselineIds(new Set(draftIds))
      setMutationError(null)
      return true
    } catch (error) {
      setMutationError(getMutationMessage(error))
      return false
    }
  }

  function completePendingIntent() {
    if (!pendingIntent) return
    if (pendingIntent.type === 'role') {
      const nextRole = getRoleById(workspace.roles, pendingIntent.roleId)
      if (nextRole) selectRole(nextRole)
    } else if (pendingIntent.type === 'navigation') {
      router.push(pendingIntent.href as Route)
    } else {
      historyTraversal.current = 'leaving'
      window.history.back()
    }
    setPendingIntent(null)
    setDialogOpen(false)
  }

  async function saveBeforeContinuing() {
    if (await saveDraft()) completePendingIntent()
  }

  return (
    <>
      <div className="border-border bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border md:flex-row">
        <RoleSelector
          roles={workspace.roles}
          selectedRoleId={selectedRole.roleId}
          disabled={saving}
          onSelect={requestRoleChange}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-labelledby="role-heading">
          <PermissionEditorHeader
            roleLabel={roleContent.label}
            roleDescription={roleContent.description}
            directCount={draftIds.size}
            effectiveCount={effectiveCount}
            moduleCount={permissionGroups.length}
            searchText={searchText}
            dirty={isDirty}
            pending={saving}
            canCollapse={openModules.length > 0 && !searchText.trim()}
            onSearchChange={setSearchText}
            onCollapseAll={() => setOpenModules([])}
            onDiscard={() => {
              setDraftIds(new Set(baselineIds))
              setMutationError(null)
            }}
            onSave={() => void saveDraft()}
          />

          {mutationError && (
            <Alert variant="destructive" className="m-3 mb-0 shrink-0 sm:mx-4">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Chưa thể lưu quyền</AlertTitle>
              <AlertDescription>{mutationError}</AlertDescription>
            </Alert>
          )}

          <ScrollArea className="bg-muted/10 min-h-0 flex-1">
            <div className="p-3 sm:p-4">
              <PermissionCatalog
                groups={filteredGroups}
                roleId={selectedRole.roleId}
                roleName={selectedRole.roleName}
                selectedIds={draftIds}
                inheritedIds={inheritedIds}
                openModules={visibleOpenModules}
                disabled={saving}
                hasSearch={Boolean(searchText.trim())}
                onOpenModulesChange={(modules) => {
                  if (!searchText.trim()) setOpenModules(modules)
                }}
                onTogglePermission={togglePermission}
                onToggleModule={toggleModule}
              />
            </div>
          </ScrollArea>
        </section>
      </div>

      <UnsavedChangesDialog
        open={dialogOpen}
        saving={saving}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setPendingIntent(null)
        }}
        onSave={() => void saveBeforeContinuing()}
        onDiscard={completePendingIntent}
      />
    </>
  )
}
