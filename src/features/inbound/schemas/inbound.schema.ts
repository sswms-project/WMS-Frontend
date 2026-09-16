import { z } from 'zod'
import { dotNetGuidSchema } from '@/lib/dotnet-guid.schema'

export const receiptLineSchema = z
  .object({
    poLineId: dotNetGuidSchema('Dòng đơn mua không hợp lệ.'),
    receivedQty: z.number().positive('Số lượng nhận phải lớn hơn 0.'),
    damagedQty: z.number().min(0, 'Số lượng hỏng không được âm.'),
    exceptionReason: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự.'),
    isLotTracked: z.boolean(),
    lotNumber: z.string().trim().max(100, 'Số lô không được vượt quá 100 ký tự.'),
    manufacturedDate: z.string(),
    expiryDate: z.string(),
  })
  .superRefine((line, context) => {
    if (line.damagedQty > line.receivedQty) {
      context.addIssue({
        code: 'custom',
        path: ['damagedQty'],
        message: 'Số lượng hỏng không được lớn hơn số lượng nhận.',
      })
    }
    if (line.damagedQty > 0 && line.exceptionReason.trim().length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['exceptionReason'],
        message: 'Vui lòng ghi rõ tình trạng hàng hỏng.',
      })
    }
    if (line.isLotTracked && !line.lotNumber) {
      context.addIssue({
        code: 'custom',
        path: ['lotNumber'],
        message: 'Vui lòng nhập số lô cho sản phẩm quản lý theo lô.',
      })
    }
    if (!line.isLotTracked && (line.lotNumber || line.manufacturedDate || line.expiryDate)) {
      context.addIssue({
        code: 'custom',
        path: ['lotNumber'],
        message: 'Sản phẩm quản lý theo số lượng không nhận thông tin lô.',
      })
    }
    if (
      line.manufacturedDate &&
      line.expiryDate &&
      new Date(line.expiryDate) < new Date(line.manufacturedDate)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: 'Hạn sử dụng phải bằng hoặc sau ngày sản xuất.',
      })
    }
  })

export const inboundReceiptSchema = z.object({
  purchaseOrderId: dotNetGuidSchema('Đơn mua không hợp lệ.'),
  lines: z.array(receiptLineSchema).min(1, 'Phiếu nhập phải có ít nhất một sản phẩm.'),
})

export const putawaySchema = z
  .object({
    lines: z
      .array(
        z.object({
          inboundReceiptItemId: dotNetGuidSchema('Dòng phiếu nhập không hợp lệ.'),
          slotId: dotNetGuidSchema('Vui lòng chọn vị trí lưu trữ.'),
          quantity: z.number().positive('Số lượng cất phải lớn hơn 0.'),
        })
      )
      .min(1, 'Vui lòng thêm ít nhất một phân bổ vị trí.'),
  })
  .superRefine((values, context) => {
    const allocations = new Set<string>()
    values.lines.forEach((line, index) => {
      const allocationKey = `${line.inboundReceiptItemId}:${line.slotId}`
      if (allocations.has(allocationKey)) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'slotId'],
          message: 'Sản phẩm đã được phân bổ vào vị trí này.',
        })
      }
      allocations.add(allocationKey)
    })
  })

export type InboundReceiptFormValues = z.infer<typeof inboundReceiptSchema>
export type PutawayFormValues = z.infer<typeof putawaySchema>
