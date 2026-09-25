import { z } from 'zod'

const optionalText = (max: number, message: string) => z.string().trim().max(max, message)

export const unitSchema = z.object({
  unitCode: z
    .string()
    .trim()
    .min(1, 'Mã đơn vị không được để trống')
    .max(50, 'Mã đơn vị tối đa 50 ký tự'),
  unitName: z
    .string()
    .trim()
    .min(1, 'Tên đơn vị không được để trống')
    .max(100, 'Tên đơn vị tối đa 100 ký tự'),
  symbol: optionalText(30, 'Ký hiệu tối đa 30 ký tự'),
  quantityPrecision: z
    .number()
    .int('Số chữ số thập phân phải là số nguyên')
    .min(0, 'Số chữ số thập phân tối thiểu là 0')
    .max(6, 'Số chữ số thập phân tối đa là 6'),
  description: optionalText(255, 'Mô tả tối đa 255 ký tự'),
})

export type UnitFormValues = z.infer<typeof unitSchema>

export const categorySchema = z.object({
  categoryCode: z
    .string()
    .trim()
    .min(1, 'Mã nhóm không được để trống')
    .max(50, 'Mã nhóm tối đa 50 ký tự'),
  categoryName: z
    .string()
    .trim()
    .min(1, 'Tên danh mục không được để trống')
    .max(255, 'Tên danh mục tối đa 255 ký tự'),
  parentCategoryId: z.string().nullable(),
  description: optionalText(500, 'Mô tả tối đa 500 ký tự'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const productUnitConversionSchema = z.object({
  unitId: z.string().min(1, 'Vui lòng chọn đơn vị quy đổi'),
  conversionFactor: z
    .number()
    .min(0.000001, 'Hệ số quy đổi phải lớn hơn 0 và có tối đa 6 chữ số thập phân')
    .max(999_999_999_999.999999, 'Hệ số quy đổi có tối đa 12 chữ số nguyên')
    .refine(
      (value) => (value.toString().split('.')[1]?.length ?? 0) <= 6,
      'Hệ số quy đổi có tối đa 6 chữ số thập phân'
    ),
})

export type ProductUnitConversionFormValues = z.infer<typeof productUnitConversionSchema>
