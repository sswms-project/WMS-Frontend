import { z } from 'zod'
import { dotNetGuidSchema } from '@/lib/dotnet-guid.schema'

export const transferLineSchema = z.object({
  productId: dotNetGuidSchema('Vui lòng chọn sản phẩm.'),
  sourceSlotId: dotNetGuidSchema('Vui lòng chọn vị trí xuất.'),
  destinationSlotId: dotNetGuidSchema('Vui lòng chọn vị trí nhận.'),
  quantity: z.number().positive('Số lượng phải lớn hơn 0.'),
})

export const createTransferSchema = z
  .object({
    sourceWarehouseId: dotNetGuidSchema('Vui lòng chọn kho xuất.'),
    destinationWarehouseId: dotNetGuidSchema('Vui lòng chọn kho nhận.'),
    lines: z.array(transferLineSchema).min(1, 'Phiếu điều chuyển phải có ít nhất một sản phẩm.'),
  })
  .superRefine((values, context) => {
    if (values.sourceWarehouseId && values.sourceWarehouseId === values.destinationWarehouseId) {
      context.addIssue({
        code: 'custom',
        path: ['destinationWarehouseId'],
        message: 'Kho nhận phải khác kho xuất.',
      })
    }

    const sourceKeys = new Set<string>()
    values.lines.forEach((line, index) => {
      if (line.sourceSlotId && line.sourceSlotId === line.destinationSlotId) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'destinationSlotId'],
          message: 'Vị trí nhận phải khác vị trí xuất.',
        })
      }

      const sourceKey = `${line.productId}:${line.sourceSlotId}`
      if (line.productId && line.sourceSlotId && sourceKeys.has(sourceKey)) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'sourceSlotId'],
          message: 'Sản phẩm này đã được điều chuyển từ vị trí đã chọn.',
        })
      }
      sourceKeys.add(sourceKey)
    })
  })

export const rejectTransferSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do từ chối.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.'),
})

export type CreateTransferFormValues = z.infer<typeof createTransferSchema>
export type RejectTransferFormValues = z.infer<typeof rejectTransferSchema>
