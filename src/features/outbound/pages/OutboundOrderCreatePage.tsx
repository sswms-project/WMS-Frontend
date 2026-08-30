'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { CustomerFormDialog } from '@/features/customer/components/CustomersPage'
import { useCreateCustomerMutation } from '@/features/customer/hooks/use-customers'
import {
  customerSchema,
  type CustomerFormValues,
} from '@/features/customer/schemas/customer.schema'
import { useProductListQuery } from '@/features/product/hooks/use-products'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { APP_ROUTES } from '@/routes/app-routes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  useCreateOutboundOrderMutation,
  useCustomerOptionsQuery,
} from '../hooks/use-outbound-orders'
import {
  createOutboundOrderSchema,
  type CreateOutboundOrderFormValues,
} from '../schemas/outbound.schema'

const EMPTY_LINE = { productId: '', quantity: 1 }

export default function OutboundOrderCreatePage() {
  const router = useRouter()
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [createdCustomer, setCreatedCustomer] = useState<{
    id: string
    customerName: string
    phone: string
    address: string
  } | null>(null)
  const debouncedCustomerSearch = useDebouncedValue(customerSearch, 350)
  const debouncedProductSearch = useDebouncedValue(productSearch, 350)
  const form = useForm<CreateOutboundOrderFormValues>({
    resolver: zodResolver(createOutboundOrderSchema),
    defaultValues: { customerId: '', warehouseId: '', purpose: '', lines: [{ ...EMPTY_LINE }] },
  })
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { customerName: '', phone: '', email: '', address: '' },
  })
  const selectedCustomerId = useWatch({ control: form.control, name: 'customerId' })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lines' })
  const warehouses = useWarehousesQuery({ top: 100, skip: 0, needTotalCount: true, isActive: true })
  const customers = useCustomerOptionsQuery({
    pageNumber: 1,
    pageSize: 200,
    ...(debouncedCustomerSearch.trim() ? { searchTerm: debouncedCustomerSearch.trim() } : {}),
  })
  const products = useProductListQuery({
    pageNumber: 1,
    pageSize: 200,
    ...(debouncedProductSearch.trim() ? { searchTerm: debouncedProductSearch.trim() } : {}),
  })
  const selectedCustomer =
    customers.data?.items.find((customer) => customer.id === selectedCustomerId) ??
    (createdCustomer?.id === selectedCustomerId ? createdCustomer : undefined)
  const createOrder = useCreateOutboundOrderMutation()
  const createCustomer = useCreateCustomerMutation()

  async function submit(values: CreateOutboundOrderFormValues) {
    try {
      await createOrder.mutateAsync({
        customerId: values.customerId,
        warehouseId: values.warehouseId,
        purpose: values.purpose || null,
        items: values.lines,
      })
      toast.success('Đã tạo đơn xuất kho.')
      router.push(APP_ROUTES.orders)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo đơn xuất kho.')
    }
  }

  async function quickCreate(values: CustomerFormValues) {
    try {
      const response = await createCustomer.mutateAsync({ ...values, email: values.email || null })
      setCreatedCustomer({
        id: response.data,
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
      })
      form.setValue('customerId', response.data, { shouldValidate: true })
      setQuickCustomerOpen(false)
      customerForm.reset()
      toast.success('Đã tạo và chọn khách hàng.')
    } catch {
      toast.error('Không thể tạo khách hàng.')
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-4">
      <header className="flex shrink-0 items-start gap-3 border-b pb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => router.push(APP_ROUTES.orders)}
          aria-label="Quay lại"
        >
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-primary text-xs font-medium">Xuất kho</p>
          <h1 className="text-xl font-semibold">Tạo đơn xuất kho</h1>
          <p className="text-muted-foreground text-sm">
            Thông tin người nhận được chụp từ hồ sơ khách hàng khi tạo đơn.
          </p>
        </div>
      </header>
      <form
        className="min-h-0 flex-1 space-y-5 overflow-y-auto border p-4"
        onSubmit={form.handleSubmit(submit)}
      >
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.warehouseId)}>
            <FieldLabel htmlFor="outbound-warehouse">Kho xuất</FieldLabel>
            <NativeSelect id="outbound-warehouse" {...form.register('warehouseId')}>
              <NativeSelectOption value="">Chọn kho</NativeSelectOption>
              {(warehouses.data?.items ?? []).map((w) => (
                <NativeSelectOption key={w.id} value={w.id}>
                  {w.warehouseCode} · {w.warehouseName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[form.formState.errors.warehouseId]} />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.customerId)}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="outbound-customer">Khách hàng</FieldLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  customerForm.reset({ customerName: '', phone: '', email: '', address: '' })
                  setQuickCustomerOpen(true)
                }}
              >
                <UserPlus />
                Thêm nhanh
              </Button>
            </div>
            <Input
              aria-label="Tìm khách hàng"
              placeholder="Tìm mã, tên hoặc số điện thoại"
              value={customerSearch}
              onChange={(event) => setCustomerSearch(event.target.value)}
            />
            <NativeSelect id="outbound-customer" {...form.register('customerId')}>
              <NativeSelectOption value="">
                {customers.isLoading
                  ? 'Đang tải khách hàng...'
                  : customers.isError
                    ? 'Không thể tải khách hàng'
                    : (customers.data?.items.length ?? 0) === 0
                      ? 'Không có khách hàng phù hợp'
                      : 'Chọn khách hàng'}
              </NativeSelectOption>
              {(customers.data?.items ?? []).map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.customerCode} · {c.customerName} · {c.phone}
                </NativeSelectOption>
              ))}
              {createdCustomer &&
              !(customers.data?.items ?? []).some(
                (customer) => customer.id === createdCustomer.id
              ) ? (
                <NativeSelectOption value={createdCustomer.id}>
                  Mới · {createdCustomer.customerName} · {createdCustomer.phone}
                </NativeSelectOption>
              ) : null}
            </NativeSelect>
            <FieldError errors={[form.formState.errors.customerId]} />
            {selectedCustomer ? (
              <p className="bg-muted/40 border p-2 text-xs">
                Người nhận: {selectedCustomer.customerName} · {selectedCustomer.phone} ·{' '}
                {selectedCustomer.address}
              </p>
            ) : null}
          </Field>
        </FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.purpose)}>
          <FieldLabel htmlFor="outbound-purpose">Mục đích</FieldLabel>
          <Textarea id="outbound-purpose" {...form.register('purpose')} />
          <FieldError errors={[form.formState.errors.purpose]} />
        </Field>
        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Sản phẩm</h2>
              <Input
                className="mt-2 sm:w-72"
                aria-label="Tìm sản phẩm"
                placeholder="Tìm SKU hoặc tên sản phẩm"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={() => append({ ...EMPTY_LINE })}>
              <Plus />
              Thêm dòng
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 border p-3 sm:grid-cols-[1fr_10rem_auto]">
              <Field data-invalid={Boolean(form.formState.errors.lines?.[index]?.productId)}>
                <FieldLabel htmlFor={`outbound-product-${index}`}>Sản phẩm</FieldLabel>
                <NativeSelect
                  id={`outbound-product-${index}`}
                  {...form.register(`lines.${index}.productId`)}
                >
                  <NativeSelectOption value="">
                    {products.isLoading
                      ? 'Đang tải sản phẩm...'
                      : products.isError
                        ? 'Không thể tải sản phẩm'
                        : (products.data?.items.length ?? 0) === 0
                          ? 'Không có sản phẩm phù hợp'
                          : 'Chọn sản phẩm'}
                  </NativeSelectOption>
                  {(products.data?.items ?? []).map((p) => (
                    <NativeSelectOption key={p.id} value={p.id}>
                      {p.sku} · {p.productName}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError errors={[form.formState.errors.lines?.[index]?.productId]} />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.lines?.[index]?.quantity)}>
                <FieldLabel htmlFor={`outbound-quantity-${index}`}>Số lượng</FieldLabel>
                <Input
                  id={`outbound-quantity-${index}`}
                  type="number"
                  min={0.01}
                  step="0.01"
                  {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.lines?.[index]?.quantity]} />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                aria-label="Xóa dòng"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </section>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(APP_ROUTES.orders)}>
            Hủy
          </Button>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Đang tạo…' : 'Tạo đơn'}
          </Button>
        </div>
      </form>
      <CustomerFormDialog
        open={quickCustomerOpen}
        title="Thêm nhanh khách hàng"
        description="Khách hàng mới sẽ được chọn ngay trong đơn hiện tại."
        form={customerForm}
        isPending={createCustomer.isPending}
        onOpenChange={setQuickCustomerOpen}
        onSubmit={(values) => void quickCreate(values)}
      />
    </div>
  )
}
