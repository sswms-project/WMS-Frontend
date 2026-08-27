import { USER_ROLES } from '@/config/roles'
import type {
  PermissionModuleGroup,
  TenantAssignablePermission,
  TenantRolePolicy,
} from '../types/tenant-access-control.types'

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
