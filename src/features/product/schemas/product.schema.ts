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
    sku: z
      .string()
      .min(1, 'Mã hàng hóa không được để trống')
      .max(100, 'Mã hàng hóa tối đa 100 ký tự'),
    productName: z
      .string()
      .min(1, 'Tên sản phẩm không được để trống')
      .max(255, 'Tên sản phẩm tối đa 255 ký tự'),
    description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự').nullable(),
    unitId: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
    unitConversions: z.array(
      z.object({
        unitId: z.string().min(1, 'Vui lòng chọn đơn vị quy đổi'),
        conversionFactor: z.number().positive('Tỷ lệ quy đổi phải lớn hơn 0'),
      })
    ),
    ...trackingFields,
  })
  .superRefine(validateTrackingMode)
  .superRefine((values, context) => {
    const ids = values.unitConversions.map((item) => item.unitId)
    if (ids.some((id) => id === values.unitId)) {
      context.addIssue({
        code: 'custom',
        path: ['unitConversions'],
        message: 'Đơn vị quy đổi phải khác đơn vị tính chính',
      })
    }
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: 'custom',
        path: ['unitConversions'],
        message: 'Không được chọn trùng đơn vị quy đổi',
      })
    }
  })

export type CreateProductFormValues = z.infer<typeof createProductSchema>

export const updateProductSchema = z
  .object({
    productName: z
      .string()
      .min(1, 'Tên sản phẩm không được để trống')
      .max(255, 'Tên sản phẩm tối đa 255 ký tự'),
    description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự').nullable(),
    unitId: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
    ...trackingFields,
  })
  .superRefine(validateTrackingMode)

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>

export const stockPolicySchema = z
  .object({
    warehouseId: z.string().min(1, 'Vui lòng chọn kho'),
    preferredSlotId: z.string().nullable(),
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
