import { z } from 'zod'
import { dotNetGuidSchema } from './dotnet-guid.schema'

const nonEmptyGuid = dotNetGuidSchema('Mã định danh không hợp lệ').refine(
  (value) => value !== '00000000-0000-0000-0000-000000000000',
  'Mã định danh không được rỗng'
)
const uniqueIds = z
  .array(nonEmptyGuid)
  .refine(
    (ids) => new Set(ids.map((id) => id.toLowerCase())).size === ids.length,
    'Danh sách kho không được trùng lặp'
  )

export const updateStaffWarehousesSchema = z.object({
  warehouseIds: uniqueIds,
  expectedWarehouseIds: uniqueIds,
  replacements: z
    .array(z.object({ warehouseId: nonEmptyGuid, managerId: nonEmptyGuid }))
    .refine(
      (items) => new Set(items.map((item) => item.warehouseId.toLowerCase())).size === items.length,
      'Mỗi kho chỉ được xác nhận thay quản lý một lần'
    ),
})

export type UpdateStaffWarehousesRequest = z.infer<typeof updateStaffWarehousesSchema>

export function createStaffWarehouseFormSchema(
  isManager: boolean,
  activeWarehouseIds: readonly string[]
) {
  return updateStaffWarehousesSchema.superRefine((values, context) => {
    if (!isManager && !values.warehouseIds.some((id) => activeWarehouseIds.includes(id))) {
      context.addIssue({
        code: 'custom',
        path: ['warehouseIds'],
        message: 'Nhân viên cần ít nhất một kho đang hoạt động.',
      })
    }
  })
}
