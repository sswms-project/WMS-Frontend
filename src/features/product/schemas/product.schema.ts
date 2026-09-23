import { z } from 'zod'

const trackingFields = {
  isLotTracked: z.boolean(),
  shelfLifeDays: z.number().int().positive('Số ngày sử dụng phải lớn hơn 0').nullable(),
}

function validateTrackingMode(
  values: { isLotTracked: boolean; shelfLifeDays: number | null },
  context: z.RefinementCtx
) {
  if (!values.isLotTracked && values.shelfLifeDays !== null) {
    context.addIssue({
      code: 'custom',
      path: ['shelfLifeDays'],
      message: 'Sản phẩm theo số lượng không được có số ngày sử dụng',
    })
  }
}

export const createProductSchema = z
  .object({
    sku: z.string().min(1, 'Mã SKU không được để trống').max(100, 'Mã SKU tối đa 100 ký tự'),
    productName: z
      .string()
      .min(1, 'Tên sản phẩm không được để trống')
      .max(255, 'Tên sản phẩm tối đa 255 ký tự'),
    unitId: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
    ...trackingFields,
  })
  .superRefine(validateTrackingMode)

export type CreateProductFormValues = z.infer<typeof createProductSchema>

export const updateProductSchema = z
  .object({
    productName: z
      .string()
      .min(1, 'Tên sản phẩm không được để trống')
      .max(255, 'Tên sản phẩm tối đa 255 ký tự'),
    unitId: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
    ...trackingFields,
  })
  .superRefine(validateTrackingMode)

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>

export const stockPolicySchema = z
  .object({
    warehouseId: z.string().min(1, 'Vui lòng chọn kho'),
    minStockThreshold: z.number().min(0, 'Ngưỡng tồn kho tối thiểu phải >= 0'),
    maxStockThreshold: z.number().min(0, 'Ngưỡng tồn kho tối đa phải >= 0').nullable(),
    reorderPoint: z.number().min(0, 'Điểm đặt hàng lại phải >= 0').nullable(),
    safetyStock: z.number().min(0, 'Tồn kho an toàn phải >= 0'),
    leadTimeDays: z.number().int().positive('Thời gian cung ứng phải lớn hơn 0').nullable(),
  })
  .superRefine((values, context) => {
    if (values.maxStockThreshold !== null && values.maxStockThreshold < values.minStockThreshold) {
      context.addIssue({
        code: 'custom',
        path: ['maxStockThreshold'],
        message: 'Ngưỡng tối đa phải lớn hơn hoặc bằng ngưỡng tối thiểu',
      })
    }
  })

export type StockPolicyFormValues = z.infer<typeof stockPolicySchema>
