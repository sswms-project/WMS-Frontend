import { z } from 'zod'

export const createProductSchema = z.object({
  sku: z.string().min(1, 'Mã SKU không được để trống').max(50, 'Mã SKU tối đa 50 ký tự'),
  productName: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(200, 'Tên sản phẩm tối đa 200 ký tự'),
  unitId: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  minStockThreshold: z.number().min(0, 'Ngưỡng tồn kho phải >= 0').optional(),
})

export type CreateProductFormValues = z.infer<typeof createProductSchema>

export const updateProductSchema = z.object({
  productName: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(200, 'Tên sản phẩm tối đa 200 ký tự'),
  unitId: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
})

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>

export const stockPolicySchema = z.object({
  minStockThreshold: z.number().min(0, 'Ngưỡng tồn kho tối thiểu phải >= 0'),
})

export type StockPolicyFormValues = z.infer<typeof stockPolicySchema>
