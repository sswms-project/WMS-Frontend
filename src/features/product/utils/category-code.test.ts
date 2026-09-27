import { describe, expect, it } from 'vitest'
import type { CategoryResponse } from '../types/product.types'
import { suggestCategoryCode } from './category-code'

const existing: CategoryResponse[] = [
  {
    id: 'category-1',
    parentCategoryId: null,
    categoryCode: 'NHOM-NGU-KIM',
    categoryName: 'Ngũ kim',
    description: null,
    status: 'Active',
    level: 1,
    categoryPath: 'Ngũ kim',
    hasChildren: false,
    createdAt: '2026-09-24T00:00:00Z',
    modifiedAt: null,
  },
]

describe('suggestCategoryCode', () => {
  it('creates a readable normalized code from a Vietnamese name', () => {
    expect(suggestCategoryCode('Ngũ kim', [])).toBe('NHOM-NGU-KIM')
  })

  it('adds a numeric suffix when the generated code is already in use', () => {
    expect(suggestCategoryCode('Ngũ kim', existing)).toBe('NHOM-NGU-KIM-2')
  })
})
