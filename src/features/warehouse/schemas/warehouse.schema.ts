import { z } from 'zod'

const addressSchema = z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự.')

export const createWarehouseSchema = z.object({
  warehouseCode: z.string().trim().min(1, 'Mã kho là bắt buộc.').max(50, 'Mã kho tối đa 50 ký tự.'),
  warehouseName: z
    .string()
    .trim()
    .min(1, 'Tên kho là bắt buộc.')
    .max(255, 'Tên kho tối đa 255 ký tự.'),
  address: addressSchema,
})

export const updateWarehouseSchema = z.object({
  warehouseName: z
    .string()
    .trim()
    .min(1, 'Tên kho là bắt buộc.')
    .max(255, 'Tên kho tối đa 255 ký tự.'),
  address: addressSchema,
})

export type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouseFormValues = z.infer<typeof updateWarehouseSchema>

export const zoneSchema = z.object({
  zoneCode: z
    .string()
    .trim()
    .min(1, 'Mã khu vực là bắt buộc.')
    .max(50, 'Mã khu vực tối đa 50 ký tự.'),
  zoneName: z
    .string()
    .trim()
    .min(1, 'Tên khu vực là bắt buộc.')
    .max(255, 'Tên khu vực tối đa 255 ký tự.'),
  description: z.string().trim().max(500, 'Mô tả tối đa 500 ký tự.'),
})

const optionalCapacitySchema = z
  .number({ error: 'Giới hạn số lượng phải là số.' })
  .positive('Giới hạn số lượng phải lớn hơn 0.')
  .nullable()

export const rackSchema = z
  .object({
    rackCode: z.string().trim().min(1, 'Mã kệ là bắt buộc.').max(50, 'Mã kệ tối đa 50 ký tự.'),
    rackName: z.string().trim().min(1, 'Tên kệ là bắt buộc.').max(255, 'Tên kệ tối đa 255 ký tự.'),
    storageMode: z.enum(['RackLevel', 'SlotLevel']),
    allowsMixedProducts: z.boolean(),
    capacity: optionalCapacitySchema,
    expectedRowVersion: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.allowsMixedProducts && values.capacity !== null) {
      context.addIssue({
        code: 'custom',
        path: ['capacity'],
        message: 'Không áp dụng giới hạn chung khi kệ cho phép nhiều sản phẩm.',
      })
    }
  })

export const rackNameSchema = z.object({
  rackName: z.string().trim().min(1, 'Tên kệ là bắt buộc.').max(255),
})

export const slotSchema = z
  .object({
    slotCode: z
      .string()
      .trim()
      .min(1, 'Mã vị trí là bắt buộc.')
      .max(50, 'Mã vị trí tối đa 50 ký tự.'),
    allowsMixedProducts: z.boolean(),
    capacity: optionalCapacitySchema,
    expectedRowVersion: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.allowsMixedProducts && values.capacity !== null) {
      context.addIssue({
        code: 'custom',
        path: ['capacity'],
        message: 'Không áp dụng giới hạn chung khi vị trí cho phép nhiều sản phẩm.',
      })
    }
  })

export type ZoneFormValues = z.infer<typeof zoneSchema>
export type RackFormValues = z.infer<typeof rackSchema>
export type SlotFormValues = z.infer<typeof slotSchema>
