import { z } from 'zod'
import { dotNetGuidSchema } from './dotnet-guid.schema'

export const managerAssignmentSchema = z.object({
  warehouseId: dotNetGuidSchema('Vui lòng chọn một kho'),
})

export type ManagerAssignmentFormValues = z.infer<typeof managerAssignmentSchema>
