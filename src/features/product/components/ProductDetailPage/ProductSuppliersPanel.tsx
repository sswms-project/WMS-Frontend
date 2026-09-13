'use client'

import { LoaderCircle, Pencil, Plus, RefreshCw, Store, Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { useOrganizationQuery } from '@/features/organization/hooks/use-organization'
import { useSuppliersQuery } from '@/features/supplier/hooks/use-suppliers'
import { getApiErrorMessage } from '@/lib/api-error'
import {
  useAddProductSupplierMutation,
  useDeleteProductSupplierMutation,
  useProductSuppliersQuery,
  useUpdateProductSupplierMutation,
} from '../../hooks/use-products'
import type { ProductSupplier } from '../../types/product.types'

interface ProductSuppliersPanelProps {
  readonly productId: string
  readonly canManage: boolean
}

interface FormState {
  supplierId: string
  supplierProductCode: string
  unitPrice: string
  isPreferred: boolean
}

const emptyForm: FormState = {
  supplierId: '',
  supplierProductCode: '',
  unitPrice: '',
  isPreferred: false,
}

function formatMoney(value: number | null, currency: string) {
  if (value === null) return 'Chưa nhập'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(value)
}

export function ProductSuppliersPanel({ productId, canManage }: ProductSuppliersPanelProps) {
  const productSuppliersQuery = useProductSuppliersQuery(productId)
  const suppliersQuery = useSuppliersQuery({ pageNumber: 1, pageSize: 100, status: 'Active' })
  const organizationQuery = useOrganizationQuery()
  const addMutation = useAddProductSupplierMutation(productId)
  const updateMutation = useUpdateProductSupplierMutation(productId)
  const deleteMutation = useDeleteProductSupplierMutation(productId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<ProductSupplier | null>(null)
  const [deletingLink, setDeletingLink] = useState<ProductSupplier | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const currency = organizationQuery.data?.defaultCurrency ?? 'VND'
  const links = productSuppliersQuery.data ?? []
  const linkedSupplierIds = new Set(links.map((link) => link.supplierId))
  const isSaving = addMutation.isPending || updateMutation.isPending

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
      unitPrice: link.unitPrice?.toString() ?? '',
      isPreferred: link.isPreferred,
    })
    setIsDialogOpen(true)
  }

  async function save() {
    if (!form.supplierId) {
      toast.error('Vui lòng chọn nhà cung cấp.')
      return
    }

    const unitPrice = form.unitPrice.trim() === '' ? null : Number(form.unitPrice)
    if (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0)) {
      toast.error('Đơn giá phải là số không âm.')
      return
    }

    try {
      if (editingLink) {
        await updateMutation.mutateAsync({
          linkId: editingLink.id,
          request: {
            supplierProductCode: form.supplierProductCode.trim() || null,
            unitPrice,
            isPreferred: form.isPreferred,
          },
        })
      } else {
        await addMutation.mutateAsync({
          supplierId: form.supplierId,
          supplierProductCode: form.supplierProductCode.trim() || null,
          unitPrice,
          isPreferred: form.isPreferred,
        })
      }
      toast.success(editingLink ? 'Đã cập nhật nhà cung cấp.' : 'Đã liên kết nhà cung cấp.')
      setIsDialogOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể lưu nhà cung cấp cho sản phẩm.'))
    }
  }

  async function remove() {
    if (!deletingLink) return
    try {
      await deleteMutation.mutateAsync(deletingLink.id)
      toast.success('Đã xóa liên kết nhà cung cấp.')
      setDeletingLink(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể xóa liên kết nhà cung cấp.'))
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Nhà cung cấp</CardTitle>
            <CardDescription>
              Quản lý mã hàng, đơn giá tham khảo và nhà cung cấp ưu tiên.
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
          {productSuppliersQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : productSuppliersQuery.isError ? (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Không thể tải danh sách nhà cung cấp</AlertTitle>
              <AlertDescription>
                Vui lòng kiểm tra kết nối hoặc thử tải lại dữ liệu.
              </AlertDescription>
              <AlertAction>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void productSuppliersQuery.refetch()}
                >
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
                  Liên kết ít nhất một nhà cung cấp để lưu mã hàng và đơn giá tham khảo.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Mã của nhà cung cấp</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  {canManage && <TableHead className="w-24 text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.supplierName}</TableCell>
                    <TableCell>{link.supplierProductCode ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(link.unitPrice, currency)}
                    </TableCell>
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
              Đơn giá được ghi nhận theo tiền tệ mặc định của đơn vị ({currency}).
            </DialogDescription>
          </DialogHeader>
          {!editingLink && suppliersQuery.isError && (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Không thể tải danh sách nhà cung cấp</AlertTitle>
              <AlertDescription>Hãy tải lại dữ liệu trước khi tạo liên kết.</AlertDescription>
              <AlertAction>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void suppliersQuery.refetch()}
                >
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
                disabled={
                  Boolean(editingLink) || suppliersQuery.isLoading || suppliersQuery.isError
                }
                onValueChange={(supplierId) => setForm((current) => ({ ...current, supplierId }))}
              >
                <SelectTrigger id="productSupplierSelect" className="w-full">
                  <SelectValue
                    placeholder={
                      suppliersQuery.isLoading ? 'Đang tải nhà cung cấp...' : 'Chọn nhà cung cấp'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(suppliersQuery.data?.items ?? []).map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id}
                        disabled={!editingLink && linkedSupplierIds.has(supplier.id)}
                      >
                        {supplier.supplierName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="supplierProductCode">Mã hàng của nhà cung cấp</FieldLabel>
              <Input
                id="supplierProductCode"
                maxLength={100}
                value={form.supplierProductCode}
                onChange={(event) =>
                  setForm((current) => ({ ...current, supplierProductCode: event.target.value }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="supplierUnitPrice">Đơn giá tham khảo ({currency})</FieldLabel>
              <Input
                id="supplierUnitPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(event) =>
                  setForm((current) => ({ ...current, unitPrice: event.target.value }))
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
              disabled={isSaving || (!editingLink && suppliersQuery.isError)}
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
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={deleteMutation.isPending} onClick={() => void remove()}>
              Xóa liên kết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
