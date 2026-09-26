import { z } from 'zod'

export const reportDamagedStockSchema = z
  .object({
    reportMode: z.enum(['Confirmed', 'Observation']),
    quantity: z.number().optional(),
    reason: z.string().trim().min(1, 'Lý do báo hỏng là bắt buộc.').max(500),
    relatedTaskKey: z.string().optional(),
    evidenceFile: z.custom<File>((value) => value instanceof File, 'Tệp bằng chứng là bắt buộc.'),
  })
  .superRefine((values, context) => {
    if (values.reportMode === 'Confirmed' && (!values.quantity || values.quantity <= 0)) {
      context.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Số lượng hàng hỏng phải lớn hơn 0.',
      })
    }
  })

export type ReportDamagedStockFormValues = z.infer<typeof reportDamagedStockSchema>
