import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import type { CategoryFormValues, UnitFormValues } from '../schemas/master-data.schema'
import type { CategoryResponse, UnitResponse } from '../types/product.types'
import { CategoryCatalog } from './CategoryCatalogPage'
import { UnitCatalog } from './UnitCatalogPage'

const unit: UnitResponse = {
  id: 'unit-1',
  unitCode: 'BOX',
  unitName: 'Thùng',
  symbol: 'thùng',
  quantityPrecision: 0,
  description: null,
  status: 'Active',
  createdAt: '2026-09-23T00:00:00Z',
  modifiedAt: null,
}

const category: CategoryResponse = {
  id: 'category-1',
  parentCategoryId: null,
  categoryCode: 'LK',
  categoryName: 'Linh kiện',
  description: null,
  status: 'Inactive',
  level: 1,
  categoryPath: 'Linh kiện',
  hasChildren: false,
  createdAt: '2026-09-23T00:00:00Z',
  modifiedAt: null,
}

interface CatalogState {
  readonly isLoading?: boolean
  readonly isError?: boolean
  readonly empty?: boolean
}

function UnitHarness({ isLoading = false, isError = false, empty = false }: CatalogState) {
  const form = useForm<UnitFormValues>({
    defaultValues: {
      unitCode: '',
      unitName: '',
      symbol: '',
      quantityPrecision: 0,
      description: '',
    },
  })
  return (
    <UnitCatalog
      items={empty ? [] : [unit]}
      editingUnit={null}
      form={form}
      isFormOpen={false}
      canManage={false}
      isLoading={isLoading}
      isError={isError}
      isPending={false}
      onRetry={vi.fn()}
      onCreate={vi.fn()}
      onEdit={vi.fn()}
      onFormOpenChange={vi.fn()}
      onSubmit={vi.fn()}
      onChangeStatus={vi.fn()}
    />
  )
}

function CategoryHarness({ isLoading = false, isError = false, empty = false }: CatalogState) {
  const form = useForm<CategoryFormValues>({
    defaultValues: { categoryCode: '', categoryName: '', parentCategoryId: null, description: '' },
  })
  return (
    <CategoryCatalog
      items={empty ? [] : [category]}
      editingCategory={null}
      form={form}
      isFormOpen={false}
      canCreate={false}
      canUpdate={false}
      isLoading={isLoading}
      isError={isError}
      isPending={false}
      onRetry={vi.fn()}
      onCreate={vi.fn()}
      onEdit={vi.fn()}
      onFormOpenChange={vi.fn()}
      onSubmit={vi.fn()}
      onChangeStatus={vi.fn()}
    />
  )
}

describe('master data catalogs', () => {
  it.each([
    ['loading', { isLoading: true }, 'Đang tải dữ liệu'],
    ['error', { isError: true }, 'Không thể tải đơn vị tính'],
    ['empty', { empty: true }, 'Chưa có đơn vị tính'],
    ['success', {}, 'Thùng'],
  ])('renders unit %s state', (_, state, expectedText) => {
    render(<UnitHarness {...state} />)
    expect(
      expectedText === 'Đang tải dữ liệu'
        ? screen.getByLabelText(expectedText)
        : screen.getByText(expectedText)
    ).toBeInTheDocument()
  })

  it.each([
    ['loading', { isLoading: true }, 'Đang tải dữ liệu'],
    ['error', { isError: true }, 'Không thể tải nhóm vật tư hàng hóa'],
    ['empty', { empty: true }, 'Chưa có nhóm vật tư hàng hóa'],
    ['success', {}, 'Ngừng hoạt động'],
  ])('renders category %s state', (_, state, expectedText) => {
    render(<CategoryHarness {...state} />)
    expect(
      expectedText === 'Đang tải dữ liệu'
        ? screen.getByLabelText(expectedText)
        : screen.getByText(expectedText)
    ).toBeInTheDocument()
  })
})
