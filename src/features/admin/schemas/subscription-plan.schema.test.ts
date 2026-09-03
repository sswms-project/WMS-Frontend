import { describe, expect, it } from 'vitest'
import { createSubscriptionPlanSchema, featureItemsToPayload } from './subscription-plan.schema'

describe('subscription plan schema', () => {
  it('preserves feature descriptions in the backend payload', () => {
    expect(
      featureItemsToPayload([
        {
          featureCode: 'UserManagement',
          featureType: 'Limit',
          displayName: 'Quản lý người dùng',
          description: 'Giới hạn người dùng của tenant.',
          enabled: true,
          limitValue: 25,
        },
      ])
    ).toEqual([
      {
        featureCode: 'UserManagement',
        limitValue: 25,
        description: 'Giới hạn người dùng của tenant.',
      },
    ])
  })

  it('rejects fractional values for limit features', () => {
    const result = createSubscriptionPlanSchema.safeParse({
      planName: 'Growth',
      monthlyPrice: 100,
      yearlyDiscountPercent: 10,
      displayOrder: 1,
      featureItems: [
        {
          featureCode: 'UserManagement',
          featureType: 'Limit',
          displayName: 'Quản lý người dùng',
          description: 'Giới hạn người dùng của tenant.',
          enabled: true,
          limitValue: 1.5,
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})
