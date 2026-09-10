import { z } from 'zod'
import { dotNetGuidSchema } from '@/lib/dotnet-guid.schema'

export const inboundDocumentReviewLineSchema = z
  .object({
    sourceLineNumber: z.number().int().positive(),
    purchaseOrderItemId: dotNetGuidSchema('Vui lòng chọn một dòng đơn mua hợp lệ.'),
    confirmedQuantity: z.number().positive('Số lượng xác nhận phải lớn hơn 0.'),
    damagedQuantity: z.number().min(0, 'Số lượng hỏng không được âm.'),
    exceptionReason: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự.'),
  })
  .superRefine((line, context) => {
    if (line.damagedQuantity > line.confirmedQuantity) {
      context.addIssue({
        code: 'custom',
        path: ['damagedQuantity'],
        message: 'Số lượng hỏng không được lớn hơn số lượng xác nhận.',
      })
    }
    if (line.damagedQuantity > 0 && line.exceptionReason.trim().length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['exceptionReason'],
        message: 'Vui lòng ghi rõ tình trạng hàng hỏng.',
      })
    }
  })

export const inboundDocumentReviewSchema = z
  .object({
    purchaseOrderId: dotNetGuidSchema('Đơn mua không hợp lệ.'),
    acknowledgeWarehouseMismatch: z.boolean(),
    lines: z
      .array(inboundDocumentReviewLineSchema)
      .min(1, 'Chứng từ phải có ít nhất một dòng hàng.'),
  })
  .superRefine((review, context) => {
    review.lines.forEach((line, index) => {
      const firstIndex = review.lines.findIndex(
        (candidate) => candidate.purchaseOrderItemId === line.purchaseOrderItemId
      )
      if (firstIndex !== index) {
        context.addIssue({
          code: 'custom',
          path: ['lines', index, 'purchaseOrderItemId'],
          message: 'Dòng đơn mua này đã được chọn ở một dòng chứng từ khác.',
        })
      }
    })
  })

export const inboundDocumentFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'Tệp không được để trống.')
  .refine((file) => file.size <= 10 * 1024 * 1024, 'Tệp không được vượt quá 10 MB.')
  .refine(
    (file) => /\.(pdf|jpe?g|png|docx|xlsx|csv)$/i.test(file.name),
    'Chỉ hỗ trợ PDF, JPG, PNG, DOCX, XLSX hoặc CSV.'
  )

export type InboundDocumentReviewFormValues = z.infer<typeof inboundDocumentReviewSchema>
