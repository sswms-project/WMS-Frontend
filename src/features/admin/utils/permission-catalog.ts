import type { AdminPermissionCategoryGroup, PermissionResponse } from '../types/admin.types'

export function groupAdminPermissions(
  permissions: PermissionResponse[]
): AdminPermissionCategoryGroup[] {
  const categories = new Map<string, AdminPermissionCategoryGroup>()

  for (const permission of permissions) {
    let category = categories.get(permission.category)
    if (!category) {
      category = {
        category: permission.category,
        categoryDisplayName: permission.categoryDisplayName,
        categoryDescription: permission.categoryDescription,
        categoryOrder: permission.categoryOrder,
        modules: [],
      }
      categories.set(permission.category, category)
    }

    const moduleGroup = category.modules.find((item) => item.module === permission.module)
    if (moduleGroup) moduleGroup.permissions.push(permission)
    else {
      category.modules.push({
        module: permission.module,
        moduleDisplayName: permission.moduleDisplayName,
        moduleOrder: permission.moduleOrder,
        permissions: [permission],
      })
    }
  }

  return [...categories.values()]
    .map((category) => ({
      ...category,
      modules: category.modules
        .map((module) => ({
          ...module,
          permissions: module.permissions.toSorted((left, right) =>
            left.displayName.localeCompare(right.displayName, 'vi')
          ),
        }))
        .toSorted((left, right) => left.moduleOrder - right.moduleOrder),
    }))
    .toSorted((left, right) => left.categoryOrder - right.categoryOrder)
}

export function filterAdminPermissionGroups(
  groups: AdminPermissionCategoryGroup[],
  searchText: string
) {
  const query = searchText.trim().toLocaleLowerCase('vi-VN')
  if (!query) return groups

  return groups
    .map((category) => {
      const categoryMatches = [
        category.category,
        category.categoryDisplayName,
        category.categoryDescription,
      ].some((value) => value.toLocaleLowerCase('vi-VN').includes(query))

      return {
        ...category,
        modules: category.modules
          .map((module) => {
            const moduleMatches = [module.module, module.moduleDisplayName].some((value) =>
              value.toLocaleLowerCase('vi-VN').includes(query)
            )

            return {
              ...module,
              permissions:
                categoryMatches || moduleMatches
                  ? module.permissions
                  : module.permissions.filter((permission) =>
                      [
                        permission.displayName,
                        permission.description,
                        permission.permissionKey,
                      ].some((value) => value?.toLocaleLowerCase('vi-VN').includes(query))
                    ),
            }
          })
          .filter((module) => module.permissions.length > 0),
      }
    })
    .filter((category) => category.modules.length > 0)
}
