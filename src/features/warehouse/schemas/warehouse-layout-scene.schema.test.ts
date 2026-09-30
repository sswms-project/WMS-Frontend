import { describe, expect, it } from 'vitest'
import { warehouseLayoutDecorationSchema } from './warehouse-layout-scene.schema'

describe('warehouse layout decoration schema', () => {
  it.each(['DoubleDoor', 'DirectionArrow', 'Exit', 'Forklift'] as const)(
    'accepts the %s symbol',
    (type) => {
      expect(
        warehouseLayoutDecorationSchema.safeParse({
          type,
          label: 'Biểu tượng',
          x: 0,
          y: 0,
          width: 40,
          height: 40,
          rotation: 0,
          zIndex: 1,
        }).success
      ).toBe(true)
    }
  )
})
