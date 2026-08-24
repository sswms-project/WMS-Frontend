import { z } from 'zod'
import { dotNetGuidSchema } from '@/lib/dotnet-guid.schema'

export const purchaseOrderLineSchema = z.object({
  productId: dotNetGuidSchema('Vui lòng chọn sản phẩm.'),
  quantity: z.number().positive('Số lượng phải lớn hơn 0.'),
  unitPrice: z.number().min(0, 'Đơn giá không được âm.').nullable(),
})

export const purchaseOrderSchema = z
  .object({
    warehouseId: dotNetGuidSchema('Vui lòng chọn kho nhận hàng.'),
    supplierId: dotNetGuidSchema('Vui lòng chọn nhà cung cấp.'),
    expectedDate: z.string(),
    lines: z.array(purchaseOrderLineSchema).min(1, 'Đơn mua phải có ít nhất một sản phẩm.'),
  })
  .superRefine((values, context) => {
    const productIds = new Set<string>()
    values.lines.forEach((line, index) => {
      if (productIds.has(line.productId)) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'productId'],
          message: 'Sản phẩm này đã có trong đơn mua.',
        })
      }
      productIds.add(line.productId)
    })
  })

export const rejectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do từ chối.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.'),
})

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>
export type RejectionFormValues = z.infer<typeof rejectionSchema>
