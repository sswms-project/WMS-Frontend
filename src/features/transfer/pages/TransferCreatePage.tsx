'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  useWarehousesQuery,
  useWarehouseLocationsQuery,
} from '@/features/warehouse/hooks/use-warehouse'
import { APP_ROUTES } from '@/routes/app-routes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  useCreateTransferMutation,
  useTransferSourceInventoryQuery,
  useTransferSourceWarehousesQuery,
} from '../hooks/use-transfers'
import { createTransferSchema, type CreateTransferFormValues } from '../schemas/transfer.schema'

const EMPTY_LINE = { productId: '', sourceSlotId: '', destinationSlotId: '', quantity: 1 }

export default function TransferCreatePage() {
  const router = useRouter()
  const [sourceSearch, setSourceSearch] = useState('')
  const [inventorySearch, setInventorySearch] = useState('')
  const [slotSearch, setSlotSearch] = useState('')
  const debouncedSourceSearch = useDebouncedValue(sourceSearch, 350)
  const debouncedInventorySearch = useDebouncedValue(inventorySearch, 350)
  const debouncedSlotSearch = useDebouncedValue(slotSearch, 350)
  const form = useForm<CreateTransferFormValues>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      sourceWarehouseId: '',
      destinationWarehouseId: '',
      lines: [{ ...EMPTY_LINE }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lines' })
  const sourceWarehouseId = useWatch({ control: form.control, name: 'sourceWarehouseId' })
  const destinationWarehouseId = useWatch({ control: form.control, name: 'destinationWarehouseId' })
  const watchedLines = useWatch({ control: form.control, name: 'lines' })
  const warehouses = useWarehousesQuery({ top: 100, skip: 0, needTotalCount: true, isActive: true })
  const sourceWarehouses = useTransferSourceWarehousesQuery(
    {
      destinationWarehouseId: destinationWarehouseId || '',
      top: 100,
      skip: 0,
      needTotalCount: true,
      ...(debouncedSourceSearch.trim() ? { searchText: debouncedSourceSearch.trim() } : {}),
    },
    Boolean(destinationWarehouseId)
  )
  const inventory = useTransferSourceInventoryQuery(
    {
      destinationWarehouseId: destinationWarehouseId || '',
      sourceWarehouseId: sourceWarehouseId || '',
      pageNumber: 1,
      pageSize: 100,
      ...(debouncedInventorySearch.trim() ? { searchTerm: debouncedInventorySearch.trim() } : {}),
    },
    Boolean(destinationWarehouseId && sourceWarehouseId)
  )
  const slots = useWarehouseLocationsQuery(destinationWarehouseId, {
    top: 200,
    skip: 0,
    needTotalCount: true,
    type: 'Slot',
    lifecycleStatus: 'Active',
    ...(debouncedSlotSearch.trim() ? { searchText: debouncedSlotSearch.trim() } : {}),
  })
  const mutation = useCreateTransferMutation()
  const inventoryOptions = useMemo(
    () => (inventory.data?.items ?? []).filter((item) => item.availableQuantity > 0),
    [inventory.data?.items]
  )

  async function submit(values: CreateTransferFormValues) {
    try {
      await mutation.mutateAsync({
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        items: values.lines,
      })
      toast.success('Đã tạo phiếu điều chuyển.')
      router.push(APP_ROUTES.transfers)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo phiếu điều chuyển.')
    }
  }

  function changeDestinationWarehouse(value: string) {
    form.setValue('destinationWarehouseId', value, { shouldValidate: true })
    form.setValue('sourceWarehouseId', '', { shouldValidate: true })
    form.setValue(
      'lines',
      form.getValues('lines').map((line) => ({
        ...line,
        productId: '',
        sourceSlotId: '',
        destinationSlotId: '',
      })),
      { shouldValidate: true }
    )
    setSourceSearch('')
    setInventorySearch('')
    setSlotSearch('')
  }

  function changeSourceWarehouse(value: string) {
    form.setValue('sourceWarehouseId', value, { shouldValidate: true })
    form.setValue(
      'lines',
      form.getValues('lines').map((line) => ({ ...line, productId: '', sourceSlotId: '' })),
      { shouldValidate: true }
    )
    setInventorySearch('')
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-4">
      <header className="flex shrink-0 items-start gap-3 border-b pb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => router.push(APP_ROUTES.transfers)}
          aria-label="Quay lại"
        >
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-primary text-xs font-medium">Điều chuyển kho</p>
          <h1 className="text-xl font-semibold">Tạo phiếu điều chuyển</h1>
          <p className="text-muted-foreground text-sm">
            Chọn tồn khả dụng ở kho nguồn và vị trí nhận thuộc kho đích.
          </p>
        </div>
      </header>
      <form
        className="min-h-0 flex-1 space-y-5 overflow-y-auto border p-4"
        onSubmit={form.handleSubmit(submit)}
      >
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.destinationWarehouseId)}>
            <FieldLabel htmlFor="transfer-destination">Kho đích</FieldLabel>
            <NativeSelect
              id="transfer-destination"
              value={destinationWarehouseId}
              onChange={(event) => changeDestinationWarehouse(event.target.value)}
            >
              <NativeSelectOption value="">Chọn kho đích</NativeSelectOption>
              {(warehouses.data?.items ?? []).map((w) => (
                <NativeSelectOption key={w.id} value={w.id}>
                  {w.warehouseCode} · {w.warehouseName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[form.formState.errors.destinationWarehouseId]} />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.sourceWarehouseId)}>
            <FieldLabel htmlFor="transfer-source">Kho nguồn</FieldLabel>
            <Input
              aria-label="Tìm kho nguồn"
              placeholder="Tìm mã hoặc tên kho nguồn…"
              name="sourceWarehouseSearch"
              autoComplete="off"
              value={sourceSearch}
              disabled={!destinationWarehouseId}
              onChange={(event) => setSourceSearch(event.target.value)}
            />
            <NativeSelect
              id="transfer-source"
              value={sourceWarehouseId}
              disabled={!destinationWarehouseId}
              onChange={(event) => changeSourceWarehouse(event.target.value)}
            >
              <NativeSelectOption value="">
                {destinationWarehouseId ? 'Chọn kho nguồn' : 'Chọn kho đích trước'}
              </NativeSelectOption>
              {(sourceWarehouses.data?.items ?? []).map((w) => (
                <NativeSelectOption key={w.id} value={w.id}>
                  {w.warehouseCode} · {w.warehouseName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError errors={[form.formState.errors.sourceWarehouseId]} />
          </Field>
        </FieldGroup>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Dòng hàng</h2>
              <p className="text-muted-foreground text-xs">
                Chỉ hiển thị tồn có số lượng khả dụng lớn hơn 0.
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Input
                  aria-label="Tìm tồn nguồn"
                  placeholder="Tìm SKU, sản phẩm hoặc vị trí…"
                  name="inventorySearch"
                  autoComplete="off"
                  value={inventorySearch}
                  disabled={!sourceWarehouseId}
                  onChange={(event) => setInventorySearch(event.target.value)}
                />
                <Input
                  aria-label="Tìm vị trí nhận"
                  placeholder="Tìm vị trí nhận…"
                  name="destinationSlotSearch"
                  autoComplete="off"
                  value={slotSearch}
                  disabled={!destinationWarehouseId}
                  onChange={(event) => setSlotSearch(event.target.value)}
                />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => append({ ...EMPTY_LINE })}>
              <Plus />
              Thêm dòng
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 border p-3 lg:grid-cols-[2fr_1fr_1fr_auto]">
              <Field data-invalid={Boolean(form.formState.errors.lines?.[index]?.productId)}>
                <FieldLabel htmlFor={`transfer-inventory-${index}`}>Tồn nguồn</FieldLabel>
                <NativeSelect
                  id={`transfer-inventory-${index}`}
                  value={`${watchedLines[index]?.productId ?? ''}|${watchedLines[index]?.sourceSlotId ?? ''}`}
                  onChange={(event) => {
                    const [productId = '', sourceSlotId = ''] = event.target.value.split('|')
                    form.setValue(`lines.${index}.productId`, productId, { shouldValidate: true })
                    form.setValue(`lines.${index}.sourceSlotId`, sourceSlotId, {
                      shouldValidate: true,
                    })
                  }}
                >
                  <NativeSelectOption value="|">Chọn sản phẩm/vị trí</NativeSelectOption>
                  {inventoryOptions.map((item) => (
                    <NativeSelectOption key={item.id} value={`${item.productId}|${item.slotId}`}>
                      {item.sku} · {item.productName} · {item.slotCode} ({item.availableQuantity})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError
                  errors={[
                    form.formState.errors.lines?.[index]?.productId,
                    form.formState.errors.lines?.[index]?.sourceSlotId,
                  ]}
                />
              </Field>
              <Field
                data-invalid={Boolean(form.formState.errors.lines?.[index]?.destinationSlotId)}
              >
                <FieldLabel htmlFor={`transfer-slot-${index}`}>Vị trí nhận</FieldLabel>
                <NativeSelect
                  id={`transfer-slot-${index}`}
                  {...form.register(`lines.${index}.destinationSlotId`)}
                >
                  <NativeSelectOption value="">Chọn vị trí</NativeSelectOption>
                  {(slots.data?.items ?? []).map((slot) => (
                    <NativeSelectOption key={slot.id} value={slot.id}>
                      {slot.code}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError errors={[form.formState.errors.lines?.[index]?.destinationSlotId]} />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.lines?.[index]?.quantity)}>
                <FieldLabel htmlFor={`transfer-quantity-${index}`}>Số lượng</FieldLabel>
                <Input
                  id={`transfer-quantity-${index}`}
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
          <Button type="button" variant="outline" onClick={() => router.push(APP_ROUTES.transfers)}>
            Hủy
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang tạo…' : 'Tạo phiếu'}
          </Button>
        </div>
      </form>
    </div>
  )
}
