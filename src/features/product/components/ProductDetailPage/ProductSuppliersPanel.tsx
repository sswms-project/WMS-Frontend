'use client'

import { LoaderCircle, Pencil, Plus, RefreshCw, Store, Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Supplier } from '@/features/supplier/types/supplier.types'
import type { ProductSupplier } from '../../types/product.types'

interface ProductSuppliersPanelProps {
  readonly canManage: boolean
  readonly links: readonly ProductSupplier[]
  readonly suppliers: readonly Supplier[]
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isSuppliersLoading: boolean
  readonly isSuppliersError: boolean
  readonly isSaving: boolean
  readonly isDeleting: boolean
  readonly onRetry: () => void
  readonly onRetrySuppliers: () => void
  readonly onAdd: (request: {
    supplierId: string
    supplierProductCode: string | null
    isPreferred: boolean
  }) => Promise<boolean>
  readonly onUpdate: (
    linkId: string,
    request: { supplierProductCode: string | null; isPreferred: boolean }
  ) => Promise<boolean>
  readonly onDelete: (linkId: string) => Promise<boolean>
}

interface FormState {
  supplierId: string
  supplierProductCode: string
  isPreferred: boolean
}

const emptyForm: FormState = {
  supplierId: '',
  supplierProductCode: '',
  isPreferred: false,
}

export function ProductSuppliersPanel({
  canManage,
  links,
  suppliers,
  isLoading,
  isError,
  isSuppliersLoading,
  isSuppliersError,
  isSaving,
  isDeleting,
  onRetry,
  onRetrySuppliers,
  onAdd,
  onUpdate,
  onDelete,
}: ProductSuppliersPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<ProductSupplier | null>(null)
  const [deletingLink, setDeletingLink] = useState<ProductSupplier | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const linkedSupplierIds = new Set(links.map((link) => link.supplierId))
  const selectedSupplier =
    suppliers.find((supplier) => supplier.id === form.supplierId) ??
    links.find((link) => link.supplierId === form.supplierId)

  function openCreate() {
    setEditingLink(null)
    setForm(emptyForm)
    setIsDialogOpen(true)
  }

  function openEdit(link: ProductSupplier) {
    setEditingLink(link)
    setForm({
      supplierId: link.supplierId,
      supplierProductCode: link.supplierProductCode ?? '',
      isPreferred: link.isPreferred,
    })
    setIsDialogOpen(true)
  }

  async function save() {
    if (!form.supplierId) {
      return
    }

    const saved = editingLink
      ? await onUpdate(editingLink.id, {
          supplierProductCode: form.supplierProductCode.trim() || null,
          isPreferred: form.isPreferred,
        })
      : await onAdd({
          supplierId: form.supplierId,
          supplierProductCode: form.supplierProductCode.trim() || null,
          isPreferred: form.isPreferred,
        })
    if (saved) setIsDialogOpen(false)
  }

  async function remove() {
    if (!deletingLink) return
    if (await onDelete(deletingLink.id)) setDeletingLink(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Nhà cung cấp</CardTitle>
            <CardDescription>
              Quản lý mã hàng riêng và nhà cung cấp ưu tiên của sản phẩm.
            </CardDescription>
          </div>
          {canManage && (
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              Thêm nhà cung cấp
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Không thể tải danh sách nhà cung cấp</AlertTitle>
              <AlertDescription>
                Vui lòng kiểm tra kết nối hoặc thử tải lại dữ liệu.
              </AlertDescription>
              <AlertAction>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  <RefreshCw data-icon="inline-start" aria-hidden="true" />
                  Thử lại
                </Button>
              </AlertAction>
            </Alert>
          ) : links.length === 0 ? (
            <Empty className="min-h-48 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Store aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Chưa có nhà cung cấp</EmptyTitle>
                <EmptyDescription>
                  Liên kết nhà cung cấp để lưu mã hàng riêng và đánh dấu nguồn cung ưu tiên.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Mã của nhà cung cấp</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  {canManage && <TableHead className="w-24 text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.supplierName}</TableCell>
                    <TableCell>{link.supplierProductCode ?? '—'}</TableCell>
                    <TableCell>
                      {link.isPreferred ? <Badge>Ưu tiên</Badge> : <span>—</span>}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Sửa ${link.supplierName}`}
                            onClick={() => openEdit(link)}
                          >
                            <Pencil aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Xóa ${link.supplierName}`}
                            onClick={() => setDeletingLink(link)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</DialogTitle>
            <DialogDescription>
              Lưu mã sản phẩm do nhà cung cấp sử dụng và nguồn cung ưu tiên.
            </DialogDescription>
          </DialogHeader>
          {!editingLink && isSuppliersError && (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Không thể tải danh sách nhà cung cấp</AlertTitle>
              <AlertDescription>Hãy tải lại dữ liệu trước khi tạo liên kết.</AlertDescription>
              <AlertAction>
                <Button type="button" variant="outline" size="sm" onClick={onRetrySuppliers}>
                  <RefreshCw data-icon="inline-start" aria-hidden="true" />
                  Thử lại
                </Button>
              </AlertAction>
            </Alert>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="productSupplierSelect">Nhà cung cấp</FieldLabel>
              <Select
                value={form.supplierId}
                disabled={Boolean(editingLink) || isSuppliersLoading || isSuppliersError}
                onValueChange={(supplierId) => setForm((current) => ({ ...current, supplierId }))}
              >
                <SelectTrigger id="productSupplierSelect" className="w-full">
                  <SelectValue
                    placeholder={
                      isSuppliersLoading ? 'Đang tải nhà cung cấp...' : 'Chọn nhà cung cấp'
                    }
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  collisionPadding={8}
                  className="z-[70] max-h-64"
                >
                  <SelectGroup>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id}
                        disabled={!editingLink && linkedSupplierIds.has(supplier.id)}
                      >
                        {supplier.supplierName} · {supplier.supplierCode}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="productSupplierCode">Mã nhà cung cấp</FieldLabel>
              <Input
                id="productSupplierCode"
                value={selectedSupplier?.supplierCode ?? ''}
                readOnly
                aria-readonly="true"
                placeholder="Tự điền theo nhà cung cấp đã chọn"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="supplierProductCode">Mã sản phẩm của nhà cung cấp</FieldLabel>
              <Input
                id="supplierProductCode"
                maxLength={100}
                value={form.supplierProductCode}
                onChange={(event) =>
                  setForm((current) => ({ ...current, supplierProductCode: event.target.value }))
                }
              />
            </Field>
            <Field orientation="horizontal">
              <div className="flex flex-1 flex-col gap-1">
                <FieldLabel htmlFor="preferredSupplier">Nhà cung cấp ưu tiên</FieldLabel>
                <p className="text-muted-foreground text-xs">
                  Mỗi sản phẩm chỉ có một nhà cung cấp ưu tiên.
                </p>
              </div>
              <Switch
                id="preferredSupplier"
                checked={form.isPreferred}
                onCheckedChange={(isPreferred) =>
                  setForm((current) => ({ ...current, isPreferred }))
                }
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isSaving || (!editingLink && isSuppliersError) || !form.supplierId}
              onClick={() => void save()}
            >
              {isSaving && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingLink)}
        onOpenChange={(open) => !open && setDeletingLink(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa liên kết nhà cung cấp?</AlertDialogTitle>
            <AlertDialogDescription>
              Nhà cung cấp {deletingLink?.supplierName} sẽ không còn được liên kết với sản phẩm này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={() => void remove()}>
              Xóa liên kết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
