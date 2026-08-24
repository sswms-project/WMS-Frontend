import { z } from 'zod'

export const releaseReservationSchema = z.object({
  quantity: z.number().positive('Số lượng giải phóng phải lớn hơn 0.'),
})

export type ReleaseReservationFormValues = z.infer<typeof releaseReservationSchema>
