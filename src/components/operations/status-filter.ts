export type ActiveStatusFilter = 'Active' | 'Inactive' | ''

export function parseActiveStatusFilter(value: string): ActiveStatusFilter {
  return value === 'Active' || value === 'Inactive' ? value : ''
}
