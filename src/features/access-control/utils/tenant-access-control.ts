import { USER_ROLES } from '@/config/roles'
import type {
  AccessControlMode,
  PersonalPermissionFilter,
  PermissionModuleGroup,
  PermissionRowViewModel,
  TenantAssignablePermission,
  TenantRolePolicy,
} from '../types/tenant-access-control.types'

export function isAccessControlMode(value: string): value is AccessControlMode {
  return value === 'role' || value === 'personal'
}

export function isPersonalPermissionFilter(value: string): value is PersonalPermissionFilter {
  return value === 'all' || value === 'customized'
}

const ROLE_CONTENT: Record<string, { label: string; description: string }> = {
  [USER_ROLES.WarehouseManager]: {
    label: 'Quản lý kho',
    description: 'Điều phối vận hành, phê duyệt và cấu hình trong phạm vi được giao.',
  },
  [USER_ROLES.WarehouseStaff]: {
    label: 'Nhân viên kho',
    description: 'Thực hiện các nghiệp vụ kho hằng ngày theo quyền được cấp.',
  },
}

export function getTenantRoleContent(roleName: string) {
  return (
    ROLE_CONTENT[roleName] ?? {
      label: roleName,
      description: 'Vai trò vận hành trong tenant hiện tại.',
    }
  )
}

export function arePermissionSetsEqual(left: ReadonlySet<string>, right: ReadonlySet<string>) {
  return left.size === right.size && [...left].every((permissionId) => right.has(permissionId))
}

export function groupTenantPermissions(
  permissions: TenantAssignablePermission[]
): PermissionModuleGroup[] {
  const groups = new Map<string, PermissionModuleGroup>()

  for (const permission of permissions) {
    const existing = groups.get(permission.module)
    if (existing) {
      existing.permissions.push(permission)
      continue
    }

    groups.set(permission.module, {
      module: permission.module,
      moduleDisplayName: permission.moduleDisplayName,
      permissions: [permission],
    })
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      permissions: group.permissions.toSorted((left, right) =>
        left.displayName.localeCompare(right.displayName, 'vi')
      ),
    }))
    .toSorted((left, right) => left.moduleDisplayName.localeCompare(right.moduleDisplayName, 'vi'))
}

export function filterPermissionGroups(groups: PermissionModuleGroup[], searchText: string) {
  const normalizedSearch = searchText.trim().toLocaleLowerCase('vi')
  if (!normalizedSearch) return groups

  return groups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) =>
        [
          group.moduleDisplayName,
          permission.displayName,
          permission.description,
          permission.permissionKey,
        ].some((value) => value.toLocaleLowerCase('vi').includes(normalizedSearch))
      ),
    }))
    .filter((group) => group.permissions.length > 0)
}

export function getRoleById(roles: TenantRolePolicy[], roleId: string) {
  return roles.find((role) => role.roleId === roleId)
}

export function filterPermissionGroupsByIds(
  groups: PermissionModuleGroup[],
  permissionIds: ReadonlySet<string>
) {
  return groups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) => permissionIds.has(permission.id)),
    }))
    .filter((group) => group.permissions.length > 0)
}

export function getCustomizedPermissionIds(
  effectiveIds: ReadonlySet<string>,
  roleDefaultIds: ReadonlySet<string>
) {
  return new Set(
    [...new Set([...effectiveIds, ...roleDefaultIds])].filter(
      (permissionId) => effectiveIds.has(permissionId) !== roleDefaultIds.has(permissionId)
    )
  )
}

export function createRolePermissionRow(
  permission: TenantAssignablePermission,
  roleName: string,
  selectedIds: ReadonlySet<string>,
  inheritedIds: ReadonlySet<string>
): PermissionRowViewModel {
  const eligible = permission.eligibleRoles.includes(roleName)
  const inherited = inheritedIds.has(permission.id)
  return {
    permission,
    checked: selectedIds.has(permission.id) || inherited,
    editable: eligible && !inherited,
    presentation: !eligible ? 'role-unavailable' : inherited ? 'role-inherited' : 'role-direct',
  }
}

export function createPersonalPermissionRow(
  permission: TenantAssignablePermission,
  roleName: string,
  selectedIds: ReadonlySet<string>,
  roleDefaultIds: ReadonlySet<string>
): PermissionRowViewModel {
  const eligible = permission.eligibleRoles.includes(roleName)
  const customized = selectedIds.has(permission.id) !== roleDefaultIds.has(permission.id)
  return {
    permission,
    checked: selectedIds.has(permission.id),
    editable: eligible,
    presentation: !eligible
      ? 'personal-unavailable'
      : customized
        ? 'personal-customized'
        : 'personal-default',
  }
}
