import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import type { CategoryFormValues } from '../schemas/master-data.schema'
import type { CategoryResponse } from '../types/product.types'
import { QuickCategoryDialog } from './QuickCategoryDialog'

const categories: CategoryResponse[] = [
  {
    id: 'root',
    parentCategoryId: null,
    categoryCode: 'LK',
    categoryName: 'Linh kiện',
    description: null,
    status: 'Active',
    level: 1,
    categoryPath: 'Linh kiện',
    hasChildren: true,
    createdAt: '2026-09-24T00:00:00Z',
    modifiedAt: null,
  },
  {
    id: 'level-5',
    parentCategoryId: 'root',
    categoryCode: 'CAP5',
    categoryName: 'Nhóm cấp 5',
    description: null,
    status: 'Active',
    level: 5,
    categoryPath: 'Linh kiện / Nhóm cấp 5',
    hasChildren: false,
    createdAt: '2026-09-24T00:00:00Z',
    modifiedAt: null,
  },
]

describe('QuickCategoryDialog', () => {
  it('creates a category and prevents selecting a level-five parent', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    function TestDialog() {
      const form = useForm<CategoryFormValues>({
        defaultValues: {
          categoryCode: '',
          categoryName: '',
          parentCategoryId: null,
          description: '',
        },
      })
      return (
        <QuickCategoryDialog
          form={form}
          open
          categories={categories}
          isPending={false}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />
      )
    }

    render(<TestDialog />)

    expect(screen.getByRole('option', { name: 'Linh kiện' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Linh kiện / Nhóm cấp 5' })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Mã nhóm *'), 'BULONG')
    await user.type(screen.getByLabelText('Tên nhóm *'), 'Bu lông')
    await user.selectOptions(screen.getByLabelText('Nhóm cha'), 'root')
    await user.click(screen.getByRole('button', { name: 'Tạo và chọn nhóm' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryCode: 'BULONG',
        categoryName: 'Bu lông',
        parentCategoryId: 'root',
      }),
      expect.anything()
    )
  })
})
