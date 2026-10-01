import { describe, expect, it } from 'vitest'
import { P } from '@/config/permissionCodes'
import { USER_ROLES } from '@/config/roles'
import { getWarehouseCapabilities } from './warehouse-capabilities'

describe('getWarehouseCapabilities', () => {
  it('allows a warehouse manager to configure layouts only when the permission is assigned', () => {
    expect(
      getWarehouseCapabilities(USER_ROLES.WarehouseManager, [P.WAREHOUSES_CONFIGURE_LAYOUT])
        .canConfigureLayout
    ).toBe(true)
    expect(getWarehouseCapabilities(USER_ROLES.WarehouseManager).canConfigureLayout).toBe(false)
  })
})
