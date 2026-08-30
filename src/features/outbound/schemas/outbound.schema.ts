import { z } from 'zod'
import { dotNetGuidSchema } from '@/lib/dotnet-guid.schema'
import { RETURN_ITEM_CONDITIONS } from '../types/outbound.types'

export const outboundOrderLineSchema = z.object({
  productId: dotNetGuidSchema('Vui lòng chọn sản phẩm.'),
  quantity: z.number().positive('Số lượng phải lớn hơn 0.'),
})

export const createOutboundOrderSchema = z
  .object({
    customerId: dotNetGuidSchema('Vui lòng chọn khách hàng.'),
    warehouseId: dotNetGuidSchema('Vui lòng chọn kho xuất hàng.'),
    purpose: z.string().trim().max(500, 'Mục đích không được vượt quá 500 ký tự.'),
    lines: z.array(outboundOrderLineSchema).min(1, 'Đơn xuất kho phải có ít nhất một sản phẩm.'),
  })
  .superRefine((values, context) => {
    const productIds = new Set<string>()
    values.lines.forEach((line, index) => {
      if (line.productId && productIds.has(line.productId)) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'productId'],
          message: 'Sản phẩm này đã có trong đơn xuất kho.',
        })
      }
      productIds.add(line.productId)
    })
  })

export const issueStockLineSchema = z.object({
  outboundOrderItemId: z.string(),
  productId: z.string(),
  productName: z.string(),
  sku: z.string(),
  remainingQuantity: z.number(),
  sourceSlotId: z.string(),
  pickedQuantity: z.number().min(0, 'Số lượng lấy hàng không được âm.'),
})

export const issueStockSchema = z
  .object({
    lines: z.array(issueStockLineSchema).min(1, 'Đơn xuất kho chưa có dòng hàng nào để lấy.'),
  })
  .superRefine((values, context) => {
    const hasPickedLine = values.lines.some((line) => line.pickedQuantity > 0)
    if (!hasPickedLine) {
      context.addIssue({
        code: 'custom',
        path: ['lines'],
        message: 'Vui lòng nhập số lượng lấy hàng cho ít nhất một sản phẩm.',
      })
    }

    values.lines.forEach((line, index) => {
      if (line.pickedQuantity > 0 && !line.sourceSlotId) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'sourceSlotId'],
          message: 'Vui lòng chọn vị trí lấy hàng.',
        })
      }

      if (line.pickedQuantity > line.remainingQuantity) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'pickedQuantity'],
          message: 'Số lượng lấy hàng không được vượt quá số lượng đặt.',
        })
      }
    })
  })

export const returnLineSchema = z.object({
  productId: dotNetGuidSchema('Vui lòng chọn sản phẩm.'),
  quantity: z.number().min(0, 'Số lượng không được âm.'),
  condition: z.enum(RETURN_ITEM_CONDITIONS),
  restockSlotId: z.string(),
})

export const recordReturnSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập lý do trả hàng.')
      .max(500, 'Lý do không được vượt quá 500 ký tự.'),
    lines: z.array(returnLineSchema).min(1, 'Phiếu trả hàng phải có ít nhất một sản phẩm.'),
  })
  .superRefine((values, context) => {
    if (!values.lines.some((line) => line.quantity > 0)) {
      context.addIssue({
        code: 'custom',
        path: ['lines'],
        message: 'Vui lòng chọn ít nhất một sản phẩm hoàn.',
      })
    }
    const productIds = new Set<string>()
    values.lines.forEach((line, index) => {
      if (line.productId && productIds.has(line.productId)) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'productId'],
          message: 'Sản phẩm này đã có trong phiếu trả hàng.',
        })
      }
      productIds.add(line.productId)

      if (line.quantity > 0 && line.condition === 'Good' && !line.restockSlotId) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'restockSlotId'],
          message: 'Hàng còn tốt cần chọn vị trí nhập lại kho.',
        })
      }
    })
  })

export type CreateOutboundOrderFormValues = z.infer<typeof createOutboundOrderSchema>
export type IssueStockFormValues = z.infer<typeof issueStockSchema>
export type RecordReturnFormValues = z.infer<typeof recordReturnSchema>
