import { z } from 'zod'
import { dotNetGuidSchema } from '@/lib/dotnet-guid.schema'

const cycleCountItemSchema = z.object({
  productId: dotNetGuidSchema('Sản phẩm không hợp lệ.'),
  slotId: dotNetGuidSchema('Vị trí không hợp lệ.'),
})

export const createCycleCountSchema = z
  .object({
    warehouseId: dotNetGuidSchema('Vui lòng chọn kho.'),
    zoneId: z.string(),
    scheduledDate: z.string().min(1, 'Vui lòng chọn thời gian kiểm kê.'),
    assignedTo: dotNetGuidSchema('Vui lòng chọn nhân viên phụ trách.'),
    items: z.array(cycleCountItemSchema).min(1, 'Vui lòng chọn ít nhất một vị trí tồn kho.'),
    isBlindCount: z.boolean(),
  })
  .superRefine((values, context) => {
    const keys = new Set<string>()
    values.items.forEach((item, index) => {
      const key = `${item.productId}:${item.slotId}`
      if (keys.has(key)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index],
          message: 'Sản phẩm và vị trí này đã được chọn.',
        })
      }
      keys.add(key)
    })
  })

export const recountSchema = z.object({
  itemIds: z.array(dotNetGuidSchema('Dòng kiểm kê không hợp lệ.')).min(1, 'Chọn ít nhất một dòng.'),
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do kiểm đếm lại.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.'),
})

export const stockAdjustmentSchema = z.object({
  cycleCountItemId: dotNetGuidSchema('Dòng kiểm kê không hợp lệ.'),
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do điều chỉnh.')
    .max(255, 'Lý do không được vượt quá 255 ký tự.'),
})

export const rejectStockAdjustmentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do từ chối.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.'),
})

export type CreateCycleCountFormValues = z.infer<typeof createCycleCountSchema>
export type RecountFormValues = z.infer<typeof recountSchema>
export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>
export type RejectStockAdjustmentFormValues = z.infer<typeof rejectStockAdjustmentSchema>
