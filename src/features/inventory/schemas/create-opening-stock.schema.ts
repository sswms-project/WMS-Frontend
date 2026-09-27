import { z } from 'zod'

export const createOpeningStockSchema = z
  .object({
    warehouseId: z.uuid('Mã kho không hợp lệ.'),
    evidenceFile: z
      .custom<File>((value) => value instanceof File, 'Tệp bằng chứng không hợp lệ.')
      .optional(),
    productId: z.uuid('Mã sản phẩm không hợp lệ.'),
    slotId: z.uuid('Mã vị trí không hợp lệ.'),
    lotId: z.union([z.literal(''), z.uuid('Mã lô không hợp lệ.')]),
    quantity: z.number().positive('Số lượng phải lớn hơn 0.'),
    qualityStatus: z.enum(['Good', 'Damaged']),
    eligibilityStatus: z.enum([
      'Available',
      'ReceivingHold',
      'InspectionHold',
      'DamageHold',
      'Quarantine',
    ]),
  })
  .superRefine((values, context) => {
    if (values.qualityStatus === 'Damaged' && values.eligibilityStatus !== 'DamageHold') {
      context.addIssue({
        code: 'custom',
        path: ['eligibilityStatus'],
        message: 'Hàng hư hỏng phải được đưa vào trạng thái giữ do hư hỏng.',
      })
    }
  })

export type CreateOpeningStockFormValues = z.infer<typeof createOpeningStockSchema>
