import { describe, expect, it } from 'vitest'
import { permissionDeltaSchema } from './permission-delta.schema'

const permissionId = '11111111-1111-1111-1111-111111111111'

describe('permissionDeltaSchema', () => {
  it('rejects a permission present in both delta sets', () => {
    const result = permissionDeltaSchema.safeParse({
      toAdd: [permissionId],
      toRemove: [permissionId],
    })

    expect(result.success).toBe(false)
  })

  it('accepts disjoint delta sets', () => {
    const result = permissionDeltaSchema.safeParse({
      toAdd: [permissionId],
      toRemove: ['22222222-2222-2222-2222-222222222222'],
    })

    expect(result.success).toBe(true)
  })
})
