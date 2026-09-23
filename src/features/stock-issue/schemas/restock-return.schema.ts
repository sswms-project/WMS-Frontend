import { z } from 'zod'
import { RETURN_ITEM_CONDITIONS } from '../types/outbound.types'

export const restockReturnSchema = z.object({
  items: z
    .array(
      z
        .object({
          returnItemId: z.string().uuid(),
          condition: z.enum(RETURN_ITEM_CONDITIONS),
          restockSlotId: z.string().uuid().nullable(),
        })
        .superRefine((item, context) => {
          const requiresRestockSlot = item.condition !== 'Scrap'

          if (requiresRestockSlot && item.restockSlotId === null) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['restockSlotId'],
              message: 'Vui lòng chọn vị trí nhập kho.',
            })
          }

          if (!requiresRestockSlot && item.restockSlotId !== null) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['restockSlotId'],
              message: 'Hàng loại bỏ không được nhập vào vị trí kho.',
            })
          }
        })
    )
    .min(1),
})

export type RestockReturnFormValues = z.infer<typeof restockReturnSchema>
