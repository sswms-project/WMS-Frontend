import { describe, expect, it } from 'vitest'
import { USER_ROLES } from '@/config/roles'
import { getWarehouseCapabilities } from './warehouse-capabilities'

describe('getWarehouseCapabilities', () => {
  it('allows the tenant owner to manage warehouses and their layout', () => {
    expect(getWarehouseCapabilities(USER_ROLES.TenantOwner)).toEqual({
      canCreateWarehouse: true,
      canEditWarehouse: true,
      canDeactivateWarehouse: true,
      canConfigureLayout: true,
      canGenerateLocationBarcode: true,
    })
  })

  it('allows a warehouse manager to configure layout without owner actions', () => {
    expect(getWarehouseCapabilities(USER_ROLES.WarehouseManager)).toEqual({
      canCreateWarehouse: false,
      canEditWarehouse: true,
      canDeactivateWarehouse: false,
      canConfigureLayout: true,
      canGenerateLocationBarcode: true,
    })
  })

  it('keeps warehouse staff and unauthenticated users read-only', () => {
    const readOnlyCapabilities = {
      canCreateWarehouse: false,
      canEditWarehouse: false,
      canDeactivateWarehouse: false,
      canConfigureLayout: false,
      canGenerateLocationBarcode: false,
    }

    expect(getWarehouseCapabilities(USER_ROLES.WarehouseStaff)).toEqual(readOnlyCapabilities)
    expect(getWarehouseCapabilities(null)).toEqual(readOnlyCapabilities)
  })
})
