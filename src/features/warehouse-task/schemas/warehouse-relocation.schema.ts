import { z } from 'zod'
import { dotNetGuidSchema } from '@/lib/dotnet-guid.schema'

const relocationLineSchema = z
  .object({
    sourceInventoryStockId: dotNetGuidSchema('Vui lòng chọn tồn kho nguồn.'),
    sourceSlotId: dotNetGuidSchema('Vị trí nguồn không hợp lệ.'),
    availableQuantity: z.number().positive(),
    quantity: z.number().positive('Số lượng phải lớn hơn 0.'),
    proposedDestinationSlotId: z.string().nullable(),
  })
  .superRefine((line, context) => {
    if (line.quantity > line.availableQuantity) {
      context.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Số lượng vượt quá tồn khả dụng.',
      })
    }
    if (line.proposedDestinationSlotId === line.sourceSlotId) {
      context.addIssue({
        code: 'custom',
        path: ['proposedDestinationSlotId'],
        message: 'Vị trí đích phải khác vị trí nguồn.',
      })
    }
  })

export const createWarehouseRelocationSchema = z
  .object({
    warehouseId: dotNetGuidSchema('Vui lòng chọn kho.'),
    priority: z.enum(['Normal', 'Urgent']),
    dueAt: z.string(),
    reason: z.string().trim().min(1, 'Vui lòng nhập lý do.').max(500),
    lines: z.array(relocationLineSchema).min(1, 'Cần ít nhất một dòng tồn kho.'),
  })
  .superRefine((values, context) => {
    const sources = new Set<string>()
    values.lines.forEach((line, index) => {
      if (sources.has(line.sourceInventoryStockId)) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'sourceInventoryStockId'],
          message: 'Tồn kho nguồn đã được chọn trong công việc này.',
        })
      }
      sources.add(line.sourceInventoryStockId)
    })
  })

export type CreateWarehouseRelocationFormValues = z.infer<typeof createWarehouseRelocationSchema>

export const executeWarehouseRelocationSchema = z.object({
  lineId: dotNetGuidSchema('Vui lòng chọn dòng cần thực hiện.'),
  destinationSlotId: dotNetGuidSchema('Vui lòng chọn vị trí đích.'),
  quantity: z.number().positive('Số lượng phải lớn hơn 0.'),
  overrideReason: z.string().trim().max(500),
})

export type ExecuteWarehouseRelocationFormValues = z.infer<typeof executeWarehouseRelocationSchema>
