import { describe, expect, it } from 'vitest'
import { restockReturnSchema } from './restock-return.schema'

const returnItemId = '123e4567-e89b-42d3-a456-426614174000'
const slotId = '123e4567-e89b-42d3-a456-426614174001'

describe('restockReturnSchema', () => {
  it('requires a slot for returned stock that is not scrapped', () => {
    expect(
      restockReturnSchema.safeParse({
        items: [{ returnItemId, condition: 'Good', restockSlotId: null }],
      }).success
    ).toBe(false)
  })

  it('accepts a slot for stock to be returned to inventory', () => {
    expect(
      restockReturnSchema.safeParse({
        items: [{ returnItemId, condition: 'Damaged', restockSlotId: slotId }],
      }).success
    ).toBe(true)
  })

  it('rejects a slot for scrapped stock', () => {
    expect(
      restockReturnSchema.safeParse({
        items: [{ returnItemId, condition: 'Scrap', restockSlotId: slotId }],
      }).success
    ).toBe(false)
  })
})
