'use client'

import { useState } from 'react'
import { FolderTree, Pencil, Plus, Power, RotateCcw } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { StatusChangeDialog } from '@/components/operations/StatusChangeDialog'
import type { CategoryFormValues } from '../../schemas/master-data.schema'
import type { CategoryResponse } from '../../types/product.types'

interface CategoryCatalogProps {
  readonly items: readonly CategoryResponse[]
  readonly editingCategory: CategoryResponse | null
  readonly form: UseFormReturn<CategoryFormValues>
  readonly isFormOpen: boolean
  readonly canCreate: boolean
  readonly canUpdate: boolean
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isPending: boolean
  readonly onRetry: () => void
  readonly onCreate: () => void
  readonly onEdit: (category: CategoryResponse) => void
  readonly onFormOpenChange: (open: boolean) => void
  readonly onSubmit: (values: CategoryFormValues) => void
  readonly onChangeStatus: (category: CategoryResponse) => void
}

export function CategoryCatalog({
  items,
  editingCategory,
  form,
  isFormOpen,
  canCreate,
  canUpdate,
  isLoading,
  isError,
  isPending,
  onRetry,
  onCreate,
  onEdit,
  onFormOpenChange,
  onSubmit,
  onChangeStatus,
}: CategoryCatalogProps) {
  const [statusTarget, setStatusTarget] = useState<CategoryResponse | null>(null)
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <FolderTree aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Danh mục</p>
            <h1 className="text-xl font-semibold">Danh mục sản phẩm</h1>
            <p className="text-muted-foreground text-sm">
              Phân nhóm sản phẩm để tìm kiếm, báo cáo và vận hành kho nhất quán.
            </p>
          </div>
        </div>
        {canCreate ? (
          <Button onClick={onCreate}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Thêm danh mục
          </Button>
        ) : null}
      </header>

      <section
        className="bg-card min-h-0 flex-1 overflow-auto border"
        aria-label="Danh sách danh mục sản phẩm"
      >
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải danh mục sản phẩm" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có danh mục sản phẩm"
            description="Thêm danh mục đầu tiên trước khi tạo sản phẩm."
          />
        ) : (
          <Table>
            <TableHeader className="bg-card sticky top-0 z-10">
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                {canUpdate ? <TableHead className="text-right">Thao tác</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.categoryName}</TableCell>
                  <TableCell className="max-w-lg break-words">
                    {category.description ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.status === 'Active' ? 'default' : 'outline'}>
                      {category.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </TableCell>
                  {canUpdate ? (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={category.status !== 'Active'}
                          onClick={() => onEdit(category)}
                        >
                          <Pencil data-icon="inline-start" aria-hidden="true" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => setStatusTarget(category)}
                        >
                          {category.status === 'Active' ? (
                            <Power data-icon="inline-start" aria-hidden="true" />
                          ) : (
                            <RotateCcw data-icon="inline-start" aria-hidden="true" />
                          )}
                          {category.status === 'Active' ? 'Ngừng' : 'Kích hoạt'}
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Dialog open={isFormOpen} onOpenChange={onFormOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
            <DialogDescription>
              Danh mục đang được sản phẩm sử dụng không thể ngừng hoạt động.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.categoryName)}>
                <FieldLabel htmlFor="categoryName">Tên danh mục</FieldLabel>
                <Input id="categoryName" autoComplete="off" {...form.register('categoryName')} />
                <FieldError
                  errors={
                    form.formState.errors.categoryName
                      ? [form.formState.errors.categoryName]
                      : undefined
                  }
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.description)}>
                <FieldLabel htmlFor="categoryDescription">Mô tả</FieldLabel>
                <Textarea
                  id="categoryDescription"
                  rows={3}
                  autoComplete="off"
                  {...form.register('description')}
                />
                <FieldError
                  errors={
                    form.formState.errors.description
                      ? [form.formState.errors.description]
                      : undefined
                  }
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => onFormOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang lưu…' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <StatusChangeDialog
        open={Boolean(statusTarget)}
        subject={`danh mục “${statusTarget?.categoryName ?? ''}”`}
        nextStatus={statusTarget?.status === 'Active' ? 'Inactive' : 'Active'}
        isPending={isPending}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        onConfirm={() => {
          if (!statusTarget) return
          onChangeStatus(statusTarget)
          setStatusTarget(null)
        }}
      />
    </div>
  )
}
