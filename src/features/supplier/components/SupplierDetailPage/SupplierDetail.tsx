'use client'

import { ArrowLeft, CircleOff, Pencil, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/routes/app-routes'
import type { Supplier } from '../../types/supplier.types'
import {
  SUPPLIER_STATUS_LABELS,
  formatSupplierDateTime,
  formatSupplierText,
} from '../../utils/supplier-format'
import { SupplierStatusBadge } from '../SuppliersPage'

interface SupplierDetailProps {
  readonly supplier: Supplier
  readonly canUpdate: boolean
  readonly canDeactivate: boolean
  readonly canReactivate: boolean
  readonly onEdit: () => void
  readonly onDeactivate: () => void
  readonly onReactivate: () => void
}

export function SupplierDetail({
  supplier,
  canUpdate,
  canDeactivate,
  canReactivate,
  onEdit,
  onDeactivate,
  onReactivate,
}: SupplierDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.suppliers as Route} aria-label="Quay lại danh sách">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{supplier.supplierName}</h1>
              <SupplierStatusBadge status={supplier.status} />
            </div>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Thông tin liên hệ và trạng thái hợp tác của nhà cung cấp.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canUpdate ? (
            <Button type="button" variant="outline" onClick={onEdit}>
              <Pencil aria-hidden="true" />
              Chỉnh sửa
            </Button>
          ) : null}
          {canDeactivate && supplier.status === 'Active' ? (
            <Button type="button" variant="destructive" onClick={onDeactivate}>
              <CircleOff aria-hidden="true" />
              Ngừng hợp tác
            </Button>
          ) : null}
          {canReactivate && supplier.status === 'Inactive' ? (
            <Button type="button" onClick={onReactivate}>
              <RotateCcw aria-hidden="true" />
              Khôi phục hợp tác
            </Button>
          ) : null}
        </div>
      </header>

      <section className="bg-card border" aria-labelledby="supplier-overview">
        <div className="border-b p-4">
          <h2 id="supplier-overview" className="text-sm font-semibold">
            Tổng quan
          </h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 p-4 lg:grid-cols-4">
          <Metadata label="Tên nhà cung cấp" value={supplier.supplierName} />
          <Metadata label="Số điện thoại" value={supplier.phone} />
          <Metadata label="Email" value={formatSupplierText(supplier.email)} />
          <Metadata label="Trạng thái" value={SUPPLIER_STATUS_LABELS[supplier.status]} />
          <Metadata label="Ngày tạo" value={formatSupplierDateTime(supplier.createdAt)} />
          <Metadata label="Cập nhật gần nhất" value={formatSupplierDateTime(supplier.updatedAt)} />
        </dl>
        <div className="border-t px-4 py-3">
          <p className="text-muted-foreground text-xs">Địa chỉ</p>
          <p className="mt-1 text-sm break-words">{formatSupplierText(supplier.address)}</p>
        </div>
      </section>
    </div>
  )
}

function Metadata({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  )
}
