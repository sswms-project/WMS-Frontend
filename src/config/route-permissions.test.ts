import { describe, expect, it } from 'vitest'
import { getAllowedRolesForPath } from './route-permissions'
import { USER_ROLES } from './roles'

describe('warehouse route permission', () => {
  it('allows only the tenant owner to access warehouse list and detail routes', () => {
    expect(getAllowedRolesForPath('/warehouses')).toEqual([USER_ROLES.TenantOwner])
    expect(getAllowedRolesForPath('/warehouses/497f6eca-6276-4993-bfeb-53cbbbba6f08')).toEqual([
      USER_ROLES.TenantOwner,
    ])
  })
})
