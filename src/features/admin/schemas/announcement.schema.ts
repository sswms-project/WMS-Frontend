import { z } from 'zod'

export const ANNOUNCEMENT_AUDIENCES = {
  AllActiveTenants: 'AllActiveTenants',
  ByPlan: 'ByPlan',
  SpecificTenants: 'SpecificTenants',
} as const

/** Điểm đến khi bấm vào thông báo; chỉ gồm các trang không cần mã bản ghi. */
export const ANNOUNCEMENT_ACTIONS = [
  { value: 'ViewWarehouses', label: 'Danh sách kho' },
  { value: 'ViewStaff', label: 'Nhân sự' },
  { value: 'ViewOrganization', label: 'Thông tin tổ chức' },
  { value: 'ChooseSubscriptionPlan', label: 'Chọn gói dịch vụ' },
  { value: 'ViewSubscription', label: 'Gói dịch vụ hiện tại' },
  { value: 'ViewSubscriptionPayments', label: 'Lịch sử thanh toán gói' },
] as const

export const NO_ANNOUNCEMENT_ACTION = 'none'

export const announcementSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tiêu đề.')
      .max(255, 'Tiêu đề không được vượt quá 255 ký tự.'),
    message: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập nội dung.')
      .max(1000, 'Nội dung không được vượt quá 1000 ký tự.'),
    audience: z.enum([
      ANNOUNCEMENT_AUDIENCES.AllActiveTenants,
      ANNOUNCEMENT_AUDIENCES.ByPlan,
      ANNOUNCEMENT_AUDIENCES.SpecificTenants,
    ]),
    planIds: z.array(z.string()),
    tenantIds: z.array(z.string()),
    action: z.string(),
    sendEmail: z.boolean(),
  })
  .refine(
    (values) => values.audience !== ANNOUNCEMENT_AUDIENCES.ByPlan || values.planIds.length > 0,
    { path: ['planIds'], message: 'Vui lòng chọn ít nhất một gói dịch vụ.' }
  )
  .refine(
    (values) =>
      values.audience !== ANNOUNCEMENT_AUDIENCES.SpecificTenants || values.tenantIds.length > 0,
    { path: ['tenantIds'], message: 'Vui lòng chọn ít nhất một tổ chức.' }
  )

export type AnnouncementFormValues = z.infer<typeof announcementSchema>
