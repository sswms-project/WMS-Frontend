import { describe, expect, it } from 'vitest'
import { createOpeningStockSchema } from './create-opening-stock.schema'

const file = new File(['evidence'], 'count-sheet.pdf', { type: 'application/pdf' })
const base = {
  warehouseId: '89e756b0-a22f-4c14-8f3a-5c480a1bf642',
  evidenceFile: file,
  productId: '1f9d96cb-76bc-47b4-93bc-18a1dfeeea65',
  slotId: 'fe89a609-433b-416c-87a5-5854e12b2b8a',
  lotId: '',
  quantity: 5,
  qualityStatus: 'Good',
  eligibilityStatus: 'Available',
} as const

describe('createOpeningStockSchema', () => {
  it('rejects a damaged line outside damage hold', () => {
    const result = createOpeningStockSchema.safeParse({
      ...base,
      qualityStatus: 'Damaged',
      eligibilityStatus: 'Available',
    })

    expect(result.success).toBe(false)
  })

  it('accepts a damaged line held for damage', () => {
    expect(
      createOpeningStockSchema.safeParse({
        ...base,
        qualityStatus: 'Damaged',
        eligibilityStatus: 'DamageHold',
      }).success
    ).toBe(true)
  })
})
