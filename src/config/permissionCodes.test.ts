import { describe, expect, it } from 'vitest'
import { isPlatformOnlyPermission, P } from './permissionCodes'

describe('permission scope metadata', () => {
  it('keeps platform permissions out of tenant roles', () => {
    expect(isPlatformOnlyPermission(P.SUBSCRIPTION_PLANS_VIEW)).toBe(true)
    expect(isPlatformOnlyPermission(P.ORGANIZATION_VIEW)).toBe(false)
  })
})
