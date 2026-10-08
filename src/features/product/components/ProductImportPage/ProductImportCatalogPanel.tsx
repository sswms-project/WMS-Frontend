import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { ProductImportPreview } from '../../types/product-import.types'
import type { ProductImportCatalogValues } from '../../schemas/product-import-catalog.schema'

interface Props {
  readonly open: boolean
  readonly pending: boolean
  readonly preview: ProductImportPreview
  readonly form: UseFormReturn<ProductImportCatalogValues>
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: () => void
}
export function ProductImportCatalogPanel({
  open,
  pending,
  preview,
  form,
  onOpenChange,
  onSubmit,
}: Props) {
  const values = form.watch()
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!pending) onOpenChange(value)
      }}
    >
      <SheetContent
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
        aria-busy={pending}
      >
        <SheetHeader>
          <SheetTitle>Danh mục cần xử lý</SheetTitle>
          <SheetDescription>
            Chọn danh mục có sẵn hoặc chuẩn bị tạo mới. Chưa lưu dữ liệu ở bước này.
          </SheetDescription>
        </SheetHeader>
        <form
          id="product-import-catalogs"
          className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <FieldGroup className="gap-4">
            {[true, false].map((categories) =>
              values.entries.some((entry) => entry.categories === categories) ? (
                <section key={String(categories)} className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">
                    {categories ? 'Nhóm VTHH' : 'Đơn vị tính'}
                  </h3>
                  {values.entries.map((entry, index) =>
                    entry.categories === categories ? (
                      <fieldset
                        key={`${entry.categories}:${entry.value}`}
                        className="flex min-w-0 flex-col gap-3 border p-3"
                        disabled={pending}
                      >
                        <legend className="max-w-full px-1 font-semibold wrap-anywhere">
                          {entry.value}
                        </legend>
                        <p className="text-muted-foreground text-xs">
                          Liên quan{' '}
                          {preview.missingReferences?.find(
                            (item) => item.categories === categories && item.value === entry.value
                          )?.productRows.length ?? 0}{' '}
                          dòng hàng hóa
                        </p>
                        <Field data-invalid={Boolean(form.formState.errors.entries?.[index]?.mode)}>
                          <FieldLabel htmlFor={`catalog-mode-${index}`}>Cách xử lý</FieldLabel>
                          <NativeSelect
                            id={`catalog-mode-${index}`}
                            {...form.register(`entries.${index}.mode`)}
                          >
                            <NativeSelectOption value="skip">
                              Chưa xử lý — giữ lỗi cho dòng liên quan
                            </NativeSelectOption>
                            <NativeSelectOption value="existing">
                              Dùng danh mục có sẵn
                            </NativeSelectOption>
                            {entry.canCreate ? (
                              <NativeSelectOption value="create">
                                Tạo mới khi nhập hàng hóa
                              </NativeSelectOption>
                            ) : null}
                          </NativeSelect>
                          <FieldError>
                            {form.formState.errors.entries?.[index]?.mode?.message}
                          </FieldError>
                        </Field>
                        {entry.mode === 'existing' ? (
                          <Field>
                            <FieldLabel htmlFor={`catalog-existing-${index}`}>
                              Danh mục đang hoạt động
                            </FieldLabel>
                            <NativeSelect
                              id={`catalog-existing-${index}`}
                              {...form.register(`entries.${index}.existingId`)}
                              aria-invalid={Boolean(
                                form.formState.errors.entries?.[index]?.existingId
                              )}
                            >
                              <NativeSelectOption value="">Chọn danh mục</NativeSelectOption>
                              {(categories
                                ? preview.availableCategories
                                : preview.availableUnits
                              )?.map((item) => (
                                <NativeSelectOption key={item.id} value={item.id}>
                                  {item.code} — {item.name}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                            <FieldError>
                              {form.formState.errors.entries?.[index]?.existingId?.message}
                            </FieldError>
                          </Field>
                        ) : null}
                        {entry.mode === 'create' ? (
                          <FieldGroup className="[container-type:normal] grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field
                              data-invalid={Boolean(form.formState.errors.entries?.[index]?.code)}
                            >
                              <FieldLabel htmlFor={`catalog-code-${index}`}>
                                Mã{' '}
                                <span aria-hidden="true" className="text-destructive font-bold">
                                  *
                                </span>
                              </FieldLabel>
                              <Input
                                id={`catalog-code-${index}`}
                                {...form.register(`entries.${index}.code`)}
                                aria-invalid={Boolean(form.formState.errors.entries?.[index]?.code)}
                              />
                              <FieldError>
                                {form.formState.errors.entries?.[index]?.code?.message}
                              </FieldError>
                            </Field>
                            <Field
                              data-invalid={Boolean(form.formState.errors.entries?.[index]?.name)}
                            >
                              <FieldLabel htmlFor={`catalog-name-${index}`}>
                                Tên{' '}
                                <span aria-hidden="true" className="text-destructive font-bold">
                                  *
                                </span>
                              </FieldLabel>
                              <Input
                                id={`catalog-name-${index}`}
                                {...form.register(`entries.${index}.name`)}
                                aria-invalid={Boolean(form.formState.errors.entries?.[index]?.name)}
                              />
                              <FieldError>
                                {form.formState.errors.entries?.[index]?.name?.message}
                              </FieldError>
                            </Field>
                            {categories ? (
                              <Field>
                                <FieldLabel htmlFor={`catalog-parent-${index}`}>
                                  Nhóm cha (tùy chọn)
                                </FieldLabel>
                                <NativeSelect
                                  id={`catalog-parent-${index}`}
                                  {...form.register(`entries.${index}.parentCode`)}
                                >
                                  <NativeSelectOption value="">Nhóm cấp gốc</NativeSelectOption>
                                  {preview.availableCategories?.map((item) => (
                                    <NativeSelectOption key={item.id} value={item.code}>
                                      {item.code} — {item.name}
                                    </NativeSelectOption>
                                  ))}
                                </NativeSelect>
                              </Field>
                            ) : (
                              <>
                                <Field>
                                  <FieldLabel htmlFor={`catalog-symbol-${index}`}>
                                    Ký hiệu (tùy chọn)
                                  </FieldLabel>
                                  <Input
                                    id={`catalog-symbol-${index}`}
                                    {...form.register(`entries.${index}.symbol`)}
                                  />
                                  <FieldError>
                                    {form.formState.errors.entries?.[index]?.symbol?.message}
                                  </FieldError>
                                </Field>
                                <Field>
                                  <FieldLabel htmlFor={`catalog-precision-${index}`}>
                                    Số chữ số thập phân
                                  </FieldLabel>
                                  <Input
                                    id={`catalog-precision-${index}`}
                                    type="number"
                                    min={0}
                                    max={6}
                                    {...form.register(`entries.${index}.quantityPrecision`, {
                                      valueAsNumber: true,
                                    })}
                                  />
                                  <FieldError>
                                    {
                                      form.formState.errors.entries?.[index]?.quantityPrecision
                                        ?.message
                                    }
                                  </FieldError>
                                </Field>
                              </>
                            )}
                          </FieldGroup>
                        ) : null}
                      </fieldset>
                    ) : null
                  )}
                </section>
              ) : null
            )}
          </FieldGroup>
        </form>
        <SheetFooter className="shrink-0 border-t">
          <Field orientation="horizontal">
            <Checkbox
              id="catalog-confirm"
              checked={values.confirmed}
              disabled={pending}
              onCheckedChange={(value) =>
                form.setValue('confirmed', value === true, { shouldValidate: true })
              }
            />
            <FieldLabel htmlFor="catalog-confirm">
              Tôi xác nhận tạo các danh mục mới khi nhập hàng hóa.
            </FieldLabel>
          </Field>
          <FieldError>{form.formState.errors.confirmed?.message}</FieldError>
          <Button type="submit" form="product-import-catalogs" disabled={pending}>
            Áp dụng và kiểm tra lại
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
