'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { CategoryCatalog } from '../components/CategoryCatalogPage'
import {
  useCategoriesQuery,
  useChangeCategoryStatusMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../hooks/use-products'
import { categorySchema, type CategoryFormValues } from '../schemas/master-data.schema'
import type { CategoryResponse } from '../types/product.types'

export default function CategoryCatalogPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryCode: '',
      categoryName: '',
      parentCategoryId: null,
      description: '',
    },
  })
  const categoriesQuery = useCategoriesQuery()
  const meQuery = useMeQuery()
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const statusMutation = useChangeCategoryStatusMutation()
  const permissions = new Set(meQuery.data?.permissions ?? [])
  const canCreate = permissions.has(P.CATEGORIES_MANAGE)
  const canUpdate = permissions.has(P.CATEGORIES_MANAGE)

  function openCreate(parentCategoryId: string | null = null) {
    setEditingCategory(null)
    form.reset({ categoryCode: '', categoryName: '', parentCategoryId, description: '' })
    setIsFormOpen(true)
  }

  function openEdit(category: CategoryResponse) {
    setEditingCategory(category)
    form.reset({
      categoryCode: category.categoryCode,
      categoryName: category.categoryName,
      parentCategoryId: category.parentCategoryId,
      description: category.description ?? '',
    })
    setIsFormOpen(true)
  }

  async function save(values: CategoryFormValues) {
    const request = { ...values, description: values.description || null }
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, request })
        toast.success('Đã cập nhật danh mục.')
      } else {
        await createMutation.mutateAsync(request)
        toast.success('Đã thêm danh mục.')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể lưu danh mục. Vui lòng thử lại.'))
    }
  }

  async function changeStatus(category: CategoryResponse) {
    const status = category.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await statusMutation.mutateAsync({ id: category.id, status })
      toast.success(status === 'Active' ? 'Đã kích hoạt danh mục.' : 'Đã ngừng danh mục.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thay đổi trạng thái danh mục.'))
    }
  }

  async function bulkDeactivate(categories: readonly CategoryResponse[]) {
    const activeCategories = categories.filter((category) => category.status === 'Active')
    try {
      await Promise.all(
        activeCategories.map((category) =>
          statusMutation.mutateAsync({ id: category.id, status: 'Inactive' })
        )
      )
      toast.success(`Đã ngừng sử dụng ${activeCategories.length} nhóm vật tư hàng hóa.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Một số nhóm chưa thể ngừng sử dụng.'))
    }
  }

  return (
    <CategoryCatalog
      items={categoriesQuery.data ?? []}
      editingCategory={editingCategory}
      form={form}
      isFormOpen={isFormOpen}
      canCreate={canCreate}
      canUpdate={canUpdate}
      isLoading={categoriesQuery.isLoading}
      isError={categoriesQuery.isError}
      isPending={createMutation.isPending || updateMutation.isPending || statusMutation.isPending}
      onRetry={() => void categoriesQuery.refetch()}
      onCreate={(parentCategoryId) => openCreate(parentCategoryId)}
      onEdit={openEdit}
      onFormOpenChange={setIsFormOpen}
      onSubmit={(values) => void save(values)}
      onChangeStatus={(category) => void changeStatus(category)}
      onBulkDeactivate={(categories) => void bulkDeactivate(categories)}
    />
  )
}
