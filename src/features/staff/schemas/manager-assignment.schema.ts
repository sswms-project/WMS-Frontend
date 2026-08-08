import { z } from 'zod'

export const managerAssignmentSchema = z.object({
  warehouseId: z.string().uuid('Vui lòng chọn một kho'),
})

export type ManagerAssignmentFormValues = z.infer<typeof managerAssignmentSchema>
