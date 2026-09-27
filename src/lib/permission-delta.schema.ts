import { z } from 'zod'
import { nonEmptyDotNetGuidSchema } from './dotnet-guid.schema'

const permissionIdSchema = nonEmptyDotNetGuidSchema('Quyền được chọn không hợp lệ.')

export const permissionDeltaSchema = z
  .object({
    toAdd: z.array(permissionIdSchema).default([]),
    toRemove: z.array(permissionIdSchema).default([]),
  })
  .refine(
    ({ toAdd, toRemove }) => {
      const removedIds = new Set(toRemove)
      return toAdd.every((permissionId) => !removedIds.has(permissionId))
    },
    {
      message: 'Một quyền không thể đồng thời được thêm và bị thu hồi.',
      path: ['toRemove'],
    }
  )

export type PermissionDeltaInput = z.infer<typeof permissionDeltaSchema>
