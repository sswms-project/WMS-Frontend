import type { CategoryResponse } from '../types/product.types'

export function suggestCategoryCode(name: string, categories: readonly CategoryResponse[]): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const base = `NHOM-${slug || 'DANH-MUC'}`
  const usedCodes = new Set(categories.map((category) => category.categoryCode.toUpperCase()))
  if (!usedCodes.has(base)) return base

  let suffix = 2
  while (usedCodes.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}
